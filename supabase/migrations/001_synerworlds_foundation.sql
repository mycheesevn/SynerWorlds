-- 001_synerworlds_foundation.sql
-- SynerWorlds Phase 1 (public profiles across all family games):
--   1. game_registry          — the game catalog; a NEW game appears on
--                               every profile by inserting ONE row here
--                               (+ its standard <prefix>_stats table).
--   2. profiles.handle        — unique public slug for /u/<handle> URLs
--      profiles.profile_public   (username is NOT unique, so URLs cannot
--                               use it); backfilled + auto-generated for
--                               future signups by a trigger.
--   3. get_public_profile()   — one-call aggregated public profile JSON.
--   4. hub_home()             — portal home data (games + top players).
--   5. search_profiles()      — handle/name search for the portal home.
--   6. hub_sitemap_handles()  — public handles for the hub sitemap.
--
-- All statements are idempotent. Run in the Dashboard SQL editor.
-- Data sources per game (normalized inside the RPCs — games need NO
-- changes): xiangqi → profiles columns, chess → chess_stats,
-- cct → cct_stats, coganh → cg_stats. profiles/chess_stats carry no
-- losses/draws columns, so those fields come back null for those two
-- games (the hub renders only what exists — nothing is fabricated).

-- ================= 1. GAME REGISTRY =================
create table if not exists public.game_registry (
  slug         text primary key,
  name_vi      text not null,
  name_en      text not null,
  tagline_vi   text,
  tagline_en   text,
  site_url     text not null,
  stats_source text not null,
  icon         text,
  accent       text,
  sort         int not null default 100,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);
alter table public.game_registry enable row level security;
drop policy if exists "game_registry public read" on public.game_registry;
create policy "game_registry public read" on public.game_registry
  for select using (true);
grant select on public.game_registry to anon, authenticated;

insert into public.game_registry
  (slug, name_vi, name_en, tagline_vi, tagline_en, site_url, stats_source, icon, accent, sort)
values
  ('xiangqi', 'Cờ Tướng', 'Xiangqi',
   'Cờ tướng — đỉnh cao trí tuệ phương Đông', 'Xiangqi — the classic game of strategy',
   'https://pacclone.vercel.app', 'profiles', '🀄', '#c0392b', 10),
  ('chess', 'Cờ Vua', 'Chess',
   'Cờ vua quốc tế — thách thức mọi kỳ thủ', 'International chess — the royal game',
   'https://chess-my-cheese-vn.vercel.app', 'chess_stats', '♞', '#34495e', 20),
  ('cct', 'Cờ Chiếu Tướng', 'Vietnamese General Check',
   'Cờ Chiếu Tướng — đặc sản trí tuệ Việt Nam', 'Vietnamese General Check — a Vietnamese folk strategy game',
   'https://cochieutuong-my-cheese-vn.vercel.app', 'cct_stats', '⚔️', '#7d3c98', 30),
  ('coganh', 'Cờ Gánh', 'Co Ganh',
   'Cờ Gánh — trò chơi dân gian Việt Nam', 'Co Ganh — the Vietnamese flipping game',
   'https://coganh-my-cheese-vn.vercel.app', 'cg_stats', '🔵', '#2569b8', 40)
on conflict (slug) do update set
  name_vi = excluded.name_vi, name_en = excluded.name_en,
  tagline_vi = excluded.tagline_vi, tagline_en = excluded.tagline_en,
  site_url = excluded.site_url, stats_source = excluded.stats_source,
  icon = excluded.icon, accent = excluded.accent, sort = excluded.sort,
  active = true;

-- ================= 2. PUBLIC HANDLE + PRIVACY FLAG =================
alter table public.profiles add column if not exists handle text;
alter table public.profiles add column if not exists profile_public boolean not null default true;

-- Slug from a username (email prefix): lowercase [a-z0-9] words joined
-- by '-'; empty/short results fall back to a stable id-derived slug.
create or replace function public.hub_slugify(p_base text, p_uid uuid)
returns text
language plpgsql immutable as $$
declare
  v text;
begin
  v := trim(both '-' from regexp_replace(lower(coalesce(p_base, '')), '[^a-z0-9]+', '-', 'g'));
  if v = '' then
    v := 'player-' || substr(replace(p_uid::text, '-', ''), 1, 6);
  elsif length(v) < 2 then
    v := v || '-player';
  end if;
  return v;
end $$;

-- First free variant of a slug: base, base-2, base-3, …
create or replace function public.hub_unique_handle(p_base text, p_self uuid)
returns text
language plpgsql as $$
declare
  v_candidate text := p_base;
  v_n int := 2;
begin
  while exists (select 1 from public.profiles where handle = v_candidate and id <> p_self) loop
    v_candidate := p_base || '-' || v_n;
    v_n := v_n + 1;
  end loop;
  return v_candidate;
end $$;

-- Backfill existing profiles (idempotent: only rows without a handle).
update public.profiles
   set handle = public.hub_unique_handle(public.hub_slugify(username, id), id)
 where handle is null;

create unique index if not exists profiles_handle_key
  on public.profiles (handle);

-- Future signups get a handle automatically (username is set by the
-- existing handle_new_user trigger before this BEFORE INSERT fires on
-- the profiles row itself).
create or replace function public.profiles_handle_autogen()
returns trigger
language plpgsql as $$
begin
  if new.handle is null then
    new.handle := public.hub_unique_handle(public.hub_slugify(new.username, new.id), new.id);
  end if;
  return new;
end $$;
drop trigger if exists profiles_handle_autogen on public.profiles;
create trigger profiles_handle_autogen
  before insert on public.profiles
  for each row execute function public.profiles_handle_autogen();

-- ================= 3. LEVEL (family XP curve) =================
-- xpForLevel(n) = 100 * (n-1) * n / 2  →  level = the largest n whose
-- threshold is <= xp. Closed form of 50*n*(n-1) <= xp.
create or replace function public.hub_level(p_xp int)
returns int
language sql immutable as $$
  select greatest(1, floor((1 + sqrt(1 + 0.08 * greatest(p_xp, 0))) / 2)::int)
$$;

-- ================= 4. PER-GAME STAT (normalized) =================
-- Internal helper for get_public_profile. Unknown stats_source → an
-- unplayed card (forward-compatible: registry row first, branch later).
create or replace function public.hub_game_stat(p_user uuid, p_source text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_rating int; v_peak int; v_xp int; v_wins int; v_losses int; v_draws int;
  v_games int; v_updated timestamptz; v_rank int; v_total int;
  v_played boolean := false;
begin
  if p_source = 'profiles' then
    select rating, peak_rating, xp, wins, games_played, last_active_date
      into v_rating, v_peak, v_xp, v_wins, v_games, v_updated
      from profiles where id = p_user;
    if v_games is not null and v_games > 0 then
      v_played := true;
      select 1 + count(*), (select count(*) from profiles where games_played > 0)
        into v_rank, v_total
        from profiles where games_played > 0 and rating > v_rating;
    end if;
  elsif p_source = 'chess_stats' then
    select rating, peak_rating, xp, wins, games_played
      into v_rating, v_peak, v_xp, v_wins, v_games
      from chess_stats where user_id = p_user;
    if v_games is not null and v_games > 0 then
      v_played := true;
      select 1 + count(*), (select count(*) from chess_stats where games_played > 0)
        into v_rank, v_total
        from chess_stats where games_played > 0 and rating > v_rating;
    end if;
  elsif p_source = 'cct_stats' then
    select rating, peak_rating, xp, wins, losses, draws, games_played, updated_at
      into v_rating, v_peak, v_xp, v_wins, v_losses, v_draws, v_games, v_updated
      from cct_stats where user_id = p_user;
    if v_games is not null and v_games > 0 then
      v_played := true;
      select 1 + count(*), (select count(*) from cct_stats where games_played > 0)
        into v_rank, v_total
        from cct_stats where games_played > 0 and rating > v_rating;
    end if;
  elsif p_source = 'cg_stats' then
    select rating, peak_rating, xp, wins, losses, draws, games_played, updated_at
      into v_rating, v_peak, v_xp, v_wins, v_losses, v_draws, v_games, v_updated
      from cg_stats where user_id = p_user;
    if v_games is not null and v_games > 0 then
      v_played := true;
      select 1 + count(*), (select count(*) from cg_stats where games_played > 0)
        into v_rank, v_total
        from cg_stats where games_played > 0 and rating > v_rating;
    end if;
  end if;

  if not v_played then
    return jsonb_build_object(
      'played', false, 'rating', null, 'peak_rating', null, 'rank', null,
      'players_total', v_total, 'xp', null, 'level', null, 'wins', null,
      'losses', null, 'draws', null, 'games_played', null, 'updated_at', null);
  end if;
  return jsonb_build_object(
    'played', true, 'rating', v_rating, 'peak_rating', v_peak,
    'rank', v_rank, 'players_total', v_total, 'xp', v_xp,
    'level', public.hub_level(v_xp), 'wins', v_wins, 'losses', v_losses,
    'draws', v_draws, 'games_played', v_games, 'updated_at', v_updated);
end $$;

-- ================= 5. PUBLIC PROFILE =================
create or replace function public.get_public_profile(p_handle text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_p profiles%rowtype;
  v_games jsonb := '[]'::jsonb;
  v_g record;
  v_stat jsonb;
  v_total_xp int := 0;
  v_total_games int := 0;
  v_games_count int := 0;
  v_best int := null;
begin
  select * into v_p from profiles
   where handle = lower(trim(coalesce(p_handle, '')));
  if not found then
    return jsonb_build_object('found', false);
  end if;

  if not v_p.profile_public then
    return jsonb_build_object(
      'found', true, 'private', true, 'handle', v_p.handle,
      'display_name', coalesce(nullif(v_p.full_name, ''), nullif(v_p.username, ''), 'Player'),
      'avatar_url', v_p.avatar_url);
  end if;

  for v_g in
    select * from game_registry where active order by sort, slug
  loop
    v_stat := public.hub_game_stat(v_p.id, v_g.stats_source);
    v_games := v_games || jsonb_build_array(
      jsonb_build_object(
        'slug', v_g.slug, 'name_vi', v_g.name_vi, 'name_en', v_g.name_en,
        'tagline_vi', v_g.tagline_vi, 'tagline_en', v_g.tagline_en,
        'site_url', v_g.site_url, 'icon', v_g.icon, 'accent', v_g.accent)
      || v_stat);
    if (v_stat ->> 'played')::boolean then
      v_total_xp := v_total_xp + coalesce((v_stat ->> 'xp')::int, 0);
      v_total_games := v_total_games + coalesce((v_stat ->> 'games_played')::int, 0);
      v_games_count := v_games_count + 1;
      v_best := greatest(coalesce(v_best, 0), (v_stat ->> 'rating')::int);
    end if;
  end loop;

  return jsonb_build_object(
    'found', true, 'private', false, 'handle', v_p.handle,
    'display_name', coalesce(nullif(v_p.full_name, ''), nullif(v_p.username, ''), 'Player'),
    'avatar_url', v_p.avatar_url,
    'member_since', v_p.created_at::date,
    'totals', jsonb_build_object(
      'xp', v_total_xp, 'games_played', v_total_games,
      'games_count', v_games_count, 'best_rating', v_best),
    'games', v_games);
end $$;

-- ================= 6. PORTAL HOME =================
create or replace function public.hub_home()
returns jsonb
language sql stable security definer set search_path = public as $$
  with agg as (
    select p.id, p.handle,
           coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player') as display_name,
           p.avatar_url,
           p.xp + coalesce(cs.xp, 0) + coalesce(ct.xp, 0) + coalesce(gs.xp, 0) as total_xp,
           ((p.games_played > 0)::int + (coalesce(cs.games_played, 0) > 0)::int
            + (coalesce(ct.games_played, 0) > 0)::int + (coalesce(gs.games_played, 0) > 0)::int) as games_count,
           p.games_played + coalesce(cs.games_played, 0) + coalesce(ct.games_played, 0)
            + coalesce(gs.games_played, 0) as total_games,
           greatest(
             case when p.games_played > 0 then p.rating end,
             case when coalesce(cs.games_played, 0) > 0 then cs.rating end,
             case when coalesce(ct.games_played, 0) > 0 then ct.rating end,
             case when coalesce(gs.games_played, 0) > 0 then gs.rating end) as best_rating
      from profiles p
      left join chess_stats cs on cs.user_id = p.id
      left join cct_stats ct on ct.user_id = p.id
      left join cg_stats gs on gs.user_id = p.id
     where p.profile_public and p.handle is not null
  )
  select jsonb_build_object(
    'games', (
      select coalesce(jsonb_agg(g order by g.sort, g.slug), '[]'::jsonb)
        from (
          select r.slug, r.name_vi, r.name_en, r.tagline_vi, r.tagline_en,
                 r.site_url, r.icon, r.accent, r.sort,
                 case r.stats_source
                   when 'profiles'    then (select count(*) from profiles where games_played > 0)
                   when 'chess_stats' then (select count(*) from chess_stats where games_played > 0)
                   when 'cct_stats'   then (select count(*) from cct_stats where games_played > 0)
                   when 'cg_stats'    then (select count(*) from cg_stats where games_played > 0)
                   else 0
                 end as players
            from game_registry r where r.active
        ) g),
    'top_players', (
      select coalesce(jsonb_agg(t), '[]'::jsonb)
        from (
          select handle, display_name, avatar_url, total_xp, games_count,
                 total_games, best_rating
            from agg where games_count > 0
           order by total_xp desc, total_games desc
           limit 10
        ) t))
$$;

-- ================= 7. SEARCH =================
create or replace function public.search_profiles(p_q text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_q text := lower(trim(coalesce(p_q, '')));
begin
  if length(v_q) < 2 then
    return jsonb_build_object('results', '[]'::jsonb);
  end if;
  return (
    select jsonb_build_object('results', coalesce(jsonb_agg(r), '[]'::jsonb))
      from (
        select p.handle,
               coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player') as display_name,
               p.avatar_url,
               ((p.games_played > 0)::int + (coalesce(cs.games_played, 0) > 0)::int
                + (coalesce(ct.games_played, 0) > 0)::int + (coalesce(gs.games_played, 0) > 0)::int) as games_count,
               p.xp + coalesce(cs.xp, 0) + coalesce(ct.xp, 0) + coalesce(gs.xp, 0) as total_xp
          from profiles p
          left join chess_stats cs on cs.user_id = p.id
          left join cct_stats ct on ct.user_id = p.id
          left join cg_stats gs on gs.user_id = p.id
         where p.profile_public and p.handle is not null
           and (p.handle ilike '%' || v_q || '%'
                or p.full_name ilike '%' || v_q || '%'
                or p.username ilike '%' || v_q || '%')
         order by games_count desc, total_xp desc
         limit 10
      ) r);
end $$;

-- ================= 8. SITEMAP =================
create or replace function public.hub_sitemap_handles()
returns setof text
language sql stable security definer set search_path = public as $$
  select p.handle
    from profiles p
   where p.profile_public and p.handle is not null
     and (p.games_played > 0
          or exists (select 1 from chess_stats s where s.user_id = p.id and s.games_played > 0)
          or exists (select 1 from cct_stats s where s.user_id = p.id and s.games_played > 0)
          or exists (select 1 from cg_stats s where s.user_id = p.id and s.games_played > 0))
$$;

-- ================= 9. GRANTS =================
-- Internal helpers: no external callers (the public RPCs are DEFINER
-- and run as owner). The four public RPCs are granted to anon +
-- authenticated explicitly — public pages must work for guests.
revoke all on function public.hub_slugify(text, uuid) from public;
revoke all on function public.hub_slugify(text, uuid) from anon;
revoke all on function public.hub_unique_handle(text, uuid) from public;
revoke all on function public.hub_unique_handle(text, uuid) from anon;
revoke all on function public.hub_level(int) from public;
revoke all on function public.hub_level(int) from anon;
revoke all on function public.hub_game_stat(uuid, text) from public;
revoke all on function public.hub_game_stat(uuid, text) from anon;
revoke all on function public.get_public_profile(text) from public;
revoke all on function public.hub_home() from public;
revoke all on function public.search_profiles(text) from public;
revoke all on function public.hub_sitemap_handles() from public;
grant execute on function public.get_public_profile(text) to anon, authenticated;
grant execute on function public.hub_home() to anon, authenticated;
grant execute on function public.search_profiles(text) to anon, authenticated;
grant execute on function public.hub_sitemap_handles() to anon, authenticated;
