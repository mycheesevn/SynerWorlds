-- 005_hub_lounge.sql
-- SynerWorlds lounge, part 1 (data layer):
--   A. Profile guestbook — other players leave messages + emoji
--      reactions on /u/<handle>. Ported from the games' room-comment /
--      match-reaction pattern (same tables shape, same emoji set
--      👏 🔥 😱 👍 😮). The profile owner (or the author) can delete an
--      entry. Anti-spam: only accounts that have played at least one
--      game (any registered game) may post or react.
--   B. "Tìm đối thủ" board (looking-for-opponent) — short timed posts
--      ("tìm đối thủ Cờ Gánh tối nay, rating ~1200"); each post shows
--      the author's real rating in that game and links into the
--      challenge deep link. Posts expire (1–48h, default 12h); max 2
--      active posts per author.
--
-- All access goes through SECURITY DEFINER RPCs (the tables have RLS
-- enabled with NO direct policies). Registry-driven like 004: the
-- played-one-game gate discovers stats tables from game_registry.
-- Idempotent — run in the Dashboard SQL editor.

-- ================= TABLES =================
create table if not exists public.hub_guestbook_entries (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists hub_guestbook_entries_profile_idx
  on public.hub_guestbook_entries (profile_id, created_at desc);
alter table public.hub_guestbook_entries enable row level security;

create table if not exists public.hub_guestbook_reactions (
  entry_id uuid not null references public.hub_guestbook_entries(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null check (emoji in ('👏', '🔥', '😱', '👍', '😮')),
  created_at timestamptz not null default now(),
  primary key (entry_id, user_id, emoji)
);
alter table public.hub_guestbook_reactions enable row level security;

create table if not exists public.hub_lfg_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null references public.game_registry(slug),
  body text not null check (char_length(body) between 1 and 200),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists hub_lfg_posts_live_idx
  on public.hub_lfg_posts (expires_at desc);
create index if not exists hub_lfg_posts_game_idx
  on public.hub_lfg_posts (slug, expires_at desc);
alter table public.hub_lfg_posts enable row level security;

-- ================= INTERNAL: played-at-least-one-game gate =================
create or replace function public.hub_has_played(p_user uuid)
returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  v_g record;
  v_hit boolean;
begin
  if p_user is null then
    return false;
  end if;
  for v_g in select * from game_registry where active loop
    if v_g.stats_source = 'profiles' then
      if exists (select 1 from profiles where id = p_user and games_played > 0) then
        return true;
      end if;
    elsif v_g.stats_source ~ '^[a-z][a-z0-9_]*$'
          and to_regclass('public.' || v_g.stats_source) is not null then
      execute format(
        'select exists (select 1 from public.%I where user_id = $1 and games_played > 0)',
        v_g.stats_source)
        into v_hit using p_user;
      if v_hit then
        return true;
      end if;
    end if;
  end loop;
  return false;
end $$;

-- ================= A. GUESTBOOK =================
-- Reaction summary for one entry, as seen by p_viewer.
create or replace function public.hub_guestbook_reactions_json(p_entry uuid, p_viewer uuid)
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(r order by r.count desc, r.emoji), '[]'::jsonb)
    from (
      select emoji, count(*)::int as count,
             bool_or(user_id = p_viewer) as mine
        from hub_guestbook_reactions
       where entry_id = p_entry
       group by emoji
    ) r
$$;

create or replace function public.hub_guestbook_list(
  p_handle text, p_limit int default 10, p_offset int default 0)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_owner profiles%rowtype;
  v_viewer uuid := auth.uid();
  v_total int;
begin
  select * into v_owner from profiles
   where handle = lower(trim(coalesce(p_handle, '')));
  if not found then
    return jsonb_build_object('found', false, 'total', 0, 'entries', '[]'::jsonb);
  end if;
  if not v_owner.profile_public and v_viewer is distinct from v_owner.id then
    return jsonb_build_object('found', true, 'private', true, 'total', 0, 'entries', '[]'::jsonb);
  end if;
  select count(*) into v_total from hub_guestbook_entries
   where profile_id = v_owner.id;
  return jsonb_build_object(
    'found', true, 'private', false, 'total', v_total,
    'entries', (
      select coalesce(jsonb_agg(e order by e.created_at desc), '[]'::jsonb)
        from (
          select en.id, en.body, en.created_at,
                 a.handle as author_handle,
                 coalesce(nullif(a.full_name, ''), nullif(a.username, ''), 'Player') as author_name,
                 a.avatar_url as author_avatar,
                 public.hub_guestbook_reactions_json(en.id, v_viewer) as reactions,
                 (v_viewer is not null and (v_viewer = en.author_id or v_viewer = v_owner.id)) as can_delete
            from hub_guestbook_entries en
            join profiles a on a.id = en.author_id
           where en.profile_id = v_owner.id
           order by en.created_at desc
           limit least(greatest(coalesce(p_limit, 10), 1), 50)
           offset greatest(coalesce(p_offset, 0), 0)
        ) e));
end $$;

create or replace function public.hub_guestbook_post(p_handle text, p_body text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_owner profiles%rowtype;
  v_body text := trim(coalesce(p_body, ''));
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'login required';
  end if;
  select * into v_owner from profiles
   where handle = lower(trim(coalesce(p_handle, '')));
  if not found then
    raise exception 'profile not found';
  end if;
  if v_owner.id = v_uid then
    raise exception 'cannot write on your own guestbook';
  end if;
  if not v_owner.profile_public then
    raise exception 'profile is private';
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 500 then
    raise exception 'message must be 1-500 characters';
  end if;
  if not public.hub_has_played(v_uid) then
    raise exception 'play at least one game before writing';
  end if;
  if (select count(*) from hub_guestbook_entries
       where author_id = v_uid and created_at > now() - interval '10 minutes') >= 5 then
    raise exception 'too many messages, please slow down';
  end if;
  insert into hub_guestbook_entries (profile_id, author_id, body)
  values (v_owner.id, v_uid, v_body)
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.hub_guestbook_delete(p_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_en hub_guestbook_entries%rowtype;
begin
  if v_uid is null then
    raise exception 'login required';
  end if;
  select * into v_en from hub_guestbook_entries where id = p_id;
  if not found then
    raise exception 'entry not found';
  end if;
  if v_uid <> v_en.author_id and v_uid <> v_en.profile_id then
    raise exception 'not allowed';
  end if;
  delete from hub_guestbook_entries where id = p_id;
  return jsonb_build_object('ok', true);
end $$;

create or replace function public.hub_guestbook_react(p_entry uuid, p_emoji text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_en hub_guestbook_entries%rowtype;
  v_owner_public boolean;
begin
  if v_uid is null then
    raise exception 'login required';
  end if;
  if p_emoji not in ('👏', '🔥', '😱', '👍', '😮') then
    raise exception 'invalid reaction';
  end if;
  select * into v_en from hub_guestbook_entries where id = p_entry;
  if not found then
    raise exception 'entry not found';
  end if;
  select profile_public into v_owner_public from profiles where id = v_en.profile_id;
  if not coalesce(v_owner_public, false) and v_uid <> v_en.profile_id then
    raise exception 'profile is private';
  end if;
  if not public.hub_has_played(v_uid) then
    raise exception 'play at least one game before reacting';
  end if;
  if exists (select 1 from hub_guestbook_reactions
              where entry_id = p_entry and user_id = v_uid and emoji = p_emoji) then
    delete from hub_guestbook_reactions
     where entry_id = p_entry and user_id = v_uid and emoji = p_emoji;
  else
    insert into hub_guestbook_reactions (entry_id, user_id, emoji)
    values (p_entry, v_uid, p_emoji);
  end if;
  return jsonb_build_object('ok', true,
    'reactions', public.hub_guestbook_reactions_json(p_entry, v_uid));
end $$;

-- ================= B. TÌM ĐỐI THỦ (LFG) =================
create or replace function public.hub_lfg_list(
  p_slug text default null, p_limit int default 20, p_offset int default 0)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_viewer uuid := auth.uid();
  v_total int;
begin
  select count(*) into v_total
    from hub_lfg_posts lp
    join profiles a on a.id = lp.user_id
   where lp.expires_at > now()
     and a.profile_public and a.handle is not null
     and (p_slug is null or lp.slug = p_slug);
  return jsonb_build_object(
    'total', v_total,
    'posts', (
      select coalesce(jsonb_agg(x order by x.created_at desc), '[]'::jsonb)
        from (
          select lp.id, lp.body, lp.created_at, lp.expires_at,
                 g.slug, g.name_vi, g.name_en, g.icon, g.accent,
                 a.handle as author_handle,
                 coalesce(nullif(a.full_name, ''), nullif(a.username, ''), 'Player') as author_name,
                 a.avatar_url as author_avatar,
                 case when (public.hub_game_stat(lp.user_id, g.stats_source) ->> 'played')::boolean
                      then (public.hub_game_stat(lp.user_id, g.stats_source) ->> 'rating')::int
                 end as author_rating,
                 (v_viewer is not null and v_viewer = lp.user_id) as mine
            from hub_lfg_posts lp
            join game_registry g on g.slug = lp.slug and g.active
            join profiles a on a.id = lp.user_id
           where lp.expires_at > now()
             and a.profile_public and a.handle is not null
             and (p_slug is null or lp.slug = p_slug)
           order by lp.created_at desc
           limit least(greatest(coalesce(p_limit, 20), 1), 50)
           offset greatest(coalesce(p_offset, 0), 0)
        ) x));
end $$;

create or replace function public.hub_lfg_post(
  p_slug text, p_body text, p_hours int default 12)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_body text := trim(coalesce(p_body, ''));
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'login required';
  end if;
  if not exists (select 1 from game_registry where slug = p_slug and active) then
    raise exception 'unknown game';
  end if;
  if char_length(v_body) < 1 or char_length(v_body) > 200 then
    raise exception 'post must be 1-200 characters';
  end if;
  if not public.hub_has_played(v_uid) then
    raise exception 'play at least one game before posting';
  end if;
  if (select count(*) from hub_lfg_posts
       where user_id = v_uid and expires_at > now()) >= 2 then
    raise exception 'you already have 2 active posts';
  end if;
  insert into hub_lfg_posts (user_id, slug, body, expires_at)
  values (v_uid, p_slug, v_body,
          now() + make_interval(hours => least(greatest(coalesce(p_hours, 12), 1), 48)))
  returning id into v_id;
  return jsonb_build_object('ok', true, 'id', v_id);
end $$;

create or replace function public.hub_lfg_delete(p_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'login required';
  end if;
  delete from hub_lfg_posts where id = p_id and user_id = v_uid;
  if not found then
    raise exception 'post not found';
  end if;
  return jsonb_build_object('ok', true);
end $$;

-- ================= GRANTS =================
revoke all on function public.hub_has_played(uuid) from public;
revoke all on function public.hub_has_played(uuid) from anon;
revoke all on function public.hub_guestbook_reactions_json(uuid, uuid) from public;
revoke all on function public.hub_guestbook_reactions_json(uuid, uuid) from anon;
revoke all on function public.hub_guestbook_list(text, int, int) from public;
revoke all on function public.hub_guestbook_post(text, text) from public;
revoke all on function public.hub_guestbook_post(text, text) from anon;
revoke all on function public.hub_guestbook_delete(uuid) from public;
revoke all on function public.hub_guestbook_delete(uuid) from anon;
revoke all on function public.hub_guestbook_react(uuid, text) from public;
revoke all on function public.hub_guestbook_react(uuid, text) from anon;
revoke all on function public.hub_lfg_list(text, int, int) from public;
revoke all on function public.hub_lfg_post(text, text, int) from public;
revoke all on function public.hub_lfg_post(text, text, int) from anon;
revoke all on function public.hub_lfg_delete(uuid) from public;
revoke all on function public.hub_lfg_delete(uuid) from anon;
grant execute on function public.hub_guestbook_list(text, int, int) to anon, authenticated;
grant execute on function public.hub_guestbook_post(text, text) to authenticated;
grant execute on function public.hub_guestbook_delete(uuid) to authenticated;
grant execute on function public.hub_guestbook_react(uuid, text) to authenticated;
grant execute on function public.hub_lfg_list(text, int, int) to anon, authenticated;
grant execute on function public.hub_lfg_post(text, text, int) to authenticated;
grant execute on function public.hub_lfg_delete(uuid) to authenticated;
