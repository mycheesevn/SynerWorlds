-- 004_hub_registry_discovery.sql
-- SynerWorlds: make every hub aggregator REGISTRY-DRIVEN, so a future
-- game appears across the whole hub (home cards, profiles, public
-- rooms, friends-playing, activity feed, search, sitemap) with ZERO
-- hub changes — the game's own foundation migration just inserts its
-- game_registry row.
--
-- What a new game must provide (the family conventions, unchanged):
--   * tables  <prefix>rooms, <prefix>room_members, <prefix>room_matches,
--             <prefix>games, and a stats table named by stats_source
--             (family shape: user_id, xp, wins, games_played, rating,
--             peak_rating; losses/draws/updated_at optional);
--   * function <prefix>list_public_rooms() with the family shape
--             (id, code, name, member_count, max_players, has_active_match);
--   * ONE game_registry row with: slug, names/taglines, site_url,
--     stats_source, icon, accent, sort, prefix ('', 'chess_', …) and
--     match_col_a / match_col_b — the two player columns of
--     <prefix>room_matches (e.g. red_id/black_id).
--
-- How: game_registry gains `prefix`, `match_col_a`, `match_col_b`
-- (format-checked: lowercase identifier fragments only). Every
-- aggregator now LOOPS over the active registry rows and builds its
-- per-game branches dynamically — identifiers always go through
-- format(%I) quoting and literal values through %L, and a game whose
-- tables/function are not deployed yet is skipped instead of breaking
-- the feed. All public function signatures and JSON shapes are
-- UNCHANGED, so the hub app needs no changes.
--
-- One behaviour improvement: the activity feed's vs-computer branch
-- now excludes player_color='cvc' rows for EVERY game whose games
-- table has that column (003 excluded only Chess; Xiangqi and Cờ Gánh
-- CvC runs could previously surface as "vừa thắng máy").
--
-- Idempotent — run in the Dashboard SQL editor.

-- ================= 1. REGISTRY COLUMNS =================
alter table public.game_registry add column if not exists prefix text not null default '';
alter table public.game_registry add column if not exists match_col_a text;
alter table public.game_registry add column if not exists match_col_b text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'game_registry_prefix_fmt') then
    alter table public.game_registry
      add constraint game_registry_prefix_fmt check (prefix ~ '^[a-z_]*$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'game_registry_match_col_a_fmt') then
    alter table public.game_registry
      add constraint game_registry_match_col_a_fmt
      check (match_col_a is null or match_col_a ~ '^[a-z][a-z0-9_]*$');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'game_registry_match_col_b_fmt') then
    alter table public.game_registry
      add constraint game_registry_match_col_b_fmt
      check (match_col_b is null or match_col_b ~ '^[a-z][a-z0-9_]*$');
  end if;
end $$;

update public.game_registry set prefix = '',       match_col_a = 'red_id',   match_col_b = 'black_id' where slug = 'xiangqi';
update public.game_registry set prefix = 'chess_', match_col_a = 'white_id', match_col_b = 'black_id' where slug = 'chess';
update public.game_registry set prefix = 'cct_',   match_col_a = 'red_id',   match_col_b = 'green_id' where slug = 'cct';
update public.game_registry set prefix = 'cg_',    match_col_a = 'blue_id',  match_col_b = 'red_id'   where slug = 'coganh';

-- ================= 2. PER-GAME STAT (generic) =================
-- 'profiles' stays a hand-written branch (Xiangqi stats live on the
-- shared profiles row). Every other stats_source IS the stats table
-- name: the row is read via to_jsonb, so columns a game does not have
-- (losses/draws/updated_at) simply come back null — exactly the
-- semantics 001 hand-coded per game.
create or replace function public.hub_game_stat(p_user uuid, p_source text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_rating int; v_peak int; v_xp int; v_wins int; v_losses int; v_draws int;
  v_games int; v_updated timestamptz; v_rank int; v_total int;
  v_played boolean := false;
  v_row jsonb;
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
  elsif p_source ~ '^[a-z][a-z0-9_]*$' then
    execute format('select to_jsonb(t) from public.%I t where t.user_id = $1 limit 1', p_source)
      into v_row using p_user;
    if v_row is not null then
      v_rating  := (v_row ->> 'rating')::int;
      v_peak    := (v_row ->> 'peak_rating')::int;
      v_xp      := (v_row ->> 'xp')::int;
      v_wins    := (v_row ->> 'wins')::int;
      v_losses  := (v_row ->> 'losses')::int;
      v_draws   := (v_row ->> 'draws')::int;
      v_games   := (v_row ->> 'games_played')::int;
      v_updated := (v_row ->> 'updated_at')::timestamptz;
      if v_games is not null and v_games > 0 then
        v_played := true;
        execute format('select 1 + count(*) from public.%I where games_played > 0 and rating > $1', p_source)
          into v_rank using v_rating;
        execute format('select count(*) from public.%I where games_played > 0', p_source)
          into v_total;
      end if;
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

-- ================= 3. AGGREGATE FRAGMENTS (internal) =================
-- Builds the JOIN + aggregate expressions (total XP / games count /
-- total games / best rating across all registered games) used by
-- hub_home() and search_profiles(). The 'profiles' source reads the
-- base profiles columns; other sources join their stats table as
-- s1, s2, … in registry order.
create or replace function public.hub_agg_fragments()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_g record;
  v_i int := 0;
  v_joins text := '';
  v_xp text := '0';
  v_cnt text := '0';
  v_tot text := '0';
  v_best text[] := '{}';
begin
  for v_g in select * from game_registry where active order by sort, slug loop
    if v_g.stats_source = 'profiles' then
      v_xp  := v_xp  || ' + p.xp';
      v_cnt := v_cnt || ' + (p.games_played > 0)::int';
      v_tot := v_tot || ' + p.games_played';
      v_best := array_append(v_best, 'case when p.games_played > 0 then p.rating end');
    elsif v_g.stats_source ~ '^[a-z][a-z0-9_]*$' then
      v_i := v_i + 1;
      v_joins := v_joins || format(' left join public.%I s%s on s%s.user_id = p.id', v_g.stats_source, v_i, v_i);
      v_xp  := v_xp  || format(' + coalesce(s%s.xp, 0)', v_i);
      v_cnt := v_cnt || format(' + (coalesce(s%s.games_played, 0) > 0)::int', v_i);
      v_tot := v_tot || format(' + coalesce(s%s.games_played, 0)', v_i);
      v_best := array_append(v_best, format('case when coalesce(s%s.games_played, 0) > 0 then s%s.rating end', v_i, v_i));
    end if;
  end loop;
  return jsonb_build_object(
    'joins', v_joins,
    'xp', v_xp,
    'games_count', v_cnt,
    'total_games', v_tot,
    'best_rating', case when cardinality(v_best) = 0 then 'null::int'
                        else 'greatest(' || array_to_string(v_best, ', ') || ')' end);
end $$;

-- ================= 4. PORTAL HOME =================
create or replace function public.hub_home()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_f jsonb := public.hub_agg_fragments();
  v_games jsonb := '[]'::jsonb;
  v_g record;
  v_players bigint;
  v_top jsonb;
begin
  for v_g in select * from game_registry where active order by sort, slug loop
    if v_g.stats_source = 'profiles' then
      select count(*) into v_players from profiles where games_played > 0;
    elsif v_g.stats_source ~ '^[a-z][a-z0-9_]*$' then
      execute format('select count(*) from public.%I where games_played > 0', v_g.stats_source)
        into v_players;
    else
      v_players := 0;
    end if;
    v_games := v_games || jsonb_build_array(jsonb_build_object(
      'slug', v_g.slug, 'name_vi', v_g.name_vi, 'name_en', v_g.name_en,
      'tagline_vi', v_g.tagline_vi, 'tagline_en', v_g.tagline_en,
      'site_url', v_g.site_url, 'icon', v_g.icon, 'accent', v_g.accent,
      'sort', v_g.sort, 'players', v_players));
  end loop;

  execute format(
    'select coalesce(jsonb_agg(t), ''[]''::jsonb) from (
       select p.handle,
              coalesce(nullif(p.full_name, ''''), nullif(p.username, ''''), ''Player'') as display_name,
              p.avatar_url,
              (%s) as total_xp, (%s) as games_count,
              (%s) as total_games, (%s) as best_rating
         from public.profiles p %s
        where p.profile_public and p.handle is not null
          and (%s) > 0
        order by total_xp desc, total_games desc
        limit 10
     ) t',
     v_f ->> 'xp', v_f ->> 'games_count', v_f ->> 'total_games',
     v_f ->> 'best_rating', v_f ->> 'joins', v_f ->> 'games_count')
    into v_top;

  return jsonb_build_object('games', v_games, 'top_players', v_top);
end $$;

-- ================= 5. SEARCH =================
create or replace function public.search_profiles(p_q text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_q text := lower(trim(coalesce(p_q, '')));
  v_f jsonb;
  v_out jsonb;
begin
  if length(v_q) < 2 then
    return jsonb_build_object('results', '[]'::jsonb);
  end if;
  v_f := public.hub_agg_fragments();
  execute format(
    'select jsonb_build_object(''results'', coalesce(jsonb_agg(r), ''[]''::jsonb)) from (
       select p.handle,
              coalesce(nullif(p.full_name, ''''), nullif(p.username, ''''), ''Player'') as display_name,
              p.avatar_url,
              (%s) as games_count, (%s) as total_xp
         from public.profiles p %s
        where p.profile_public and p.handle is not null
          and (p.handle ilike $1 or p.full_name ilike $1 or p.username ilike $1)
        order by games_count desc, total_xp desc
        limit 10
     ) r',
     v_f ->> 'games_count', v_f ->> 'xp', v_f ->> 'joins')
    into v_out using '%' || v_q || '%';
  return v_out;
end $$;

-- ================= 6. SITEMAP =================
create or replace function public.hub_sitemap_handles()
returns setof text
language plpgsql stable security definer set search_path = public as $$
declare
  v_cond text := 'false';
  v_g record;
begin
  for v_g in select * from game_registry where active loop
    if v_g.stats_source = 'profiles' then
      v_cond := v_cond || ' or p.games_played > 0';
    elsif v_g.stats_source ~ '^[a-z][a-z0-9_]*$' then
      v_cond := v_cond || format(
        ' or exists (select 1 from public.%I s where s.user_id = p.id and s.games_played > 0)',
        v_g.stats_source);
    end if;
  end loop;
  return query execute format(
    'select p.handle from public.profiles p
      where p.profile_public and p.handle is not null and (%s)', v_cond);
end $$;

-- ================= 7. PUBLIC ROOMS =================
-- One branch per registered game calling its <prefix>list_public_rooms().
-- A game whose function is not deployed yet is skipped (to_regprocedure).
create or replace function public.hub_public_rooms()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_g record;
  v_sql text := '';
  v_fn text;
  v_out jsonb;
begin
  for v_g in select * from game_registry where active order by sort, slug loop
    if not (v_g.prefix ~ '^[a-z_]*$') then continue; end if;
    v_fn := v_g.prefix || 'list_public_rooms';
    if to_regprocedure('public.' || v_fn || '()') is null then continue; end if;
    if v_sql <> '' then v_sql := v_sql || ' union all '; end if;
    v_sql := v_sql || format(
      'select %L::text as slug, %L::text as name_vi, %L::text as name_en,
              %L::text as icon, %L::text as accent,
              r.code, r.name, r.member_count, r.max_players, r.has_active_match,
              %L::text || ''/?room='' || r.code as join_url
         from public.%I() r',
      v_g.slug, v_g.name_vi, v_g.name_en, v_g.icon, v_g.accent,
      v_g.site_url, v_fn);
  end loop;
  if v_sql = '' then
    return jsonb_build_object('rooms', '[]'::jsonb);
  end if;
  execute 'select jsonb_build_object(''rooms'',
             coalesce(jsonb_agg(r order by r.has_active_match desc, r.member_count desc), ''[]''::jsonb))
             from (' || v_sql || ') r'
    into v_out;
  return v_out;
end $$;

-- ================= 8. FRIENDS PLAYING NOW =================
create or replace function public.hub_friends_playing()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_g record;
  v_sql text := '';
  v_out jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('authed', false, 'friends', '[]'::jsonb);
  end if;
  for v_g in select * from game_registry where active order by sort, slug loop
    if not (v_g.prefix ~ '^[a-z_]*$') then continue; end if;
    if to_regclass('public.' || v_g.prefix || 'rooms') is null
       or to_regclass('public.' || v_g.prefix || 'room_members') is null
       or to_regclass('public.' || v_g.prefix || 'room_matches') is null then
      continue;
    end if;
    if v_sql <> '' then v_sql := v_sql || ' union all '; end if;
    v_sql := v_sql || format(
      'select fr.friend_id,
              %L::text as slug, %L::text as name_vi, %L::text as name_en,
              %L::text as icon, %L::text as accent,
              r.code as room_code, r.name as room_name,
              exists (select 1 from public.%I mt
                       where mt.room_id = r.id and mt.status = ''active'') as has_active_match,
              %L::text || ''/?room='' || r.code as join_url, m.joined_at
         from public.friendships fr
         join public.%I m on m.user_id = fr.friend_id
         join public.%I r on r.id = m.room_id and r.status <> ''closed''
        where fr.user_id = $1',
      v_g.slug, v_g.name_vi, v_g.name_en, v_g.icon, v_g.accent,
      v_g.prefix || 'room_matches', v_g.site_url,
      v_g.prefix || 'room_members', v_g.prefix || 'rooms');
  end loop;
  if v_sql = '' then
    return jsonb_build_object('authed', true, 'friends', '[]'::jsonb);
  end if;
  execute 'select jsonb_build_object(''authed'', true, ''friends'',
             coalesce(jsonb_agg(f order by f.has_active_match desc, f.joined_at desc), ''[]''::jsonb))
      from (
        select distinct on (c.friend_id)
               c.friend_id, fp.handle,
               coalesce(nullif(fp.full_name, ''''), nullif(fp.username, ''''), ''Player'') as display_name,
               fp.avatar_url, c.slug, c.name_vi, c.name_en, c.icon, c.accent,
               c.room_code, c.room_name, c.has_active_match, c.join_url, c.joined_at
          from (' || v_sql || ') c
          join public.profiles fp on fp.id = c.friend_id
         order by c.friend_id, c.has_active_match desc, c.joined_at desc
      ) f'
    into v_out using v_uid;
  return v_out;
end $$;

-- ================= 9. ACTIVITY FEED =================
create or replace function public.hub_activity(p_limit int default 20)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_g record;
  v_sql text := '';
  v_out jsonb;
  v_has_pc boolean;
begin
  for v_g in select * from game_registry where active order by sort, slug loop
    if not (v_g.prefix ~ '^[a-z_]*$') then continue; end if;

    -- finished human-vs-human room matches (both players public)
    if v_g.match_col_a is not null and v_g.match_col_b is not null
       and to_regclass('public.' || v_g.prefix || 'room_matches') is not null
       and to_regclass('public.' || v_g.prefix || 'rooms') is not null then
      if v_sql <> '' then v_sql := v_sql || ' union all '; end if;
      v_sql := v_sql || format(
        'select ''match''::text as kind, %L::text as slug, %L::text as name_vi,
                %L::text as name_en, %L::text as icon, %L::text as accent,
                coalesce(mt.finished_at, mt.created_at) as at,
                wp.handle as a_handle,
                coalesce(nullif(wp.full_name, ''''), nullif(wp.username, ''''), ''Player'') as a_name,
                wp.avatar_url as a_avatar,
                lp.handle as b_handle,
                coalesce(nullif(lp.full_name, ''''), nullif(lp.username, ''''), ''Player'') as b_name,
                case when mt.winner_id is null then ''draw'' else ''win'' end as result,
                null::text as room_code, null::text as join_url
           from public.%I mt
           join public.%I r on r.id = mt.room_id
           join public.profiles wp on wp.id = coalesce(mt.winner_id, mt.%I)
           join public.profiles lp on lp.id = case when mt.winner_id is null then mt.%I
                                                   when mt.winner_id = mt.%I then mt.%I
                                                   else mt.%I end
          where mt.status = ''finished'' and mt.%I is not null and mt.%I is not null
            and wp.profile_public and wp.handle is not null
            and lp.profile_public and lp.handle is not null',
        v_g.slug, v_g.name_vi, v_g.name_en, v_g.icon, v_g.accent,
        v_g.prefix || 'room_matches', v_g.prefix || 'rooms',
        v_g.match_col_a,
        v_g.match_col_b, v_g.match_col_a, v_g.match_col_b, v_g.match_col_a,
        v_g.match_col_a, v_g.match_col_b);
    end if;

    -- wins/draws vs the computer (CvC rows excluded wherever the
    -- games table marks them with player_color = 'cvc')
    if to_regclass('public.' || v_g.prefix || 'games') is not null then
      select exists (
        select 1 from information_schema.columns
         where table_schema = 'public'
           and table_name = v_g.prefix || 'games'
           and column_name = 'player_color')
        into v_has_pc;
      if v_sql <> '' then v_sql := v_sql || ' union all '; end if;
      v_sql := v_sql || format(
        'select ''ai''::text as kind, %L::text as slug, %L::text as name_vi,
                %L::text as name_en, %L::text as icon, %L::text as accent,
                gm.created_at as at,
                p.handle as a_handle,
                coalesce(nullif(p.full_name, ''''), nullif(p.username, ''''), ''Player'') as a_name,
                p.avatar_url as a_avatar,
                null::text as b_handle, null::text as b_name,
                gm.result as result, null::text as room_code, null::text as join_url
           from public.%I gm
           join public.profiles p on p.id = gm.user_id
          where gm.result in (''win'', ''draw'')
            and p.profile_public and p.handle is not null%s',
        v_g.slug, v_g.name_vi, v_g.name_en, v_g.icon, v_g.accent,
        v_g.prefix || 'games',
        case when v_has_pc then ' and gm.player_color <> ''cvc''' else '' end);
    end if;

    -- newly opened public rooms (last 24 hours)
    if to_regclass('public.' || v_g.prefix || 'rooms') is not null then
      if v_sql <> '' then v_sql := v_sql || ' union all '; end if;
      v_sql := v_sql || format(
        'select ''room''::text as kind, %L::text as slug, %L::text as name_vi,
                %L::text as name_en, %L::text as icon, %L::text as accent,
                r.created_at as at,
                p.handle as a_handle,
                coalesce(nullif(p.full_name, ''''), nullif(p.username, ''''), ''Player'') as a_name,
                p.avatar_url as a_avatar,
                null::text as b_handle, null::text as b_name,
                null::text as result, r.code as room_code,
                %L::text || ''/?room='' || r.code as join_url
           from public.%I r
           join public.profiles p on p.id = r.leader_id
          where r.is_public and r.status <> ''closed''
            and r.created_at > now() - interval ''24 hours''
            and p.profile_public and p.handle is not null',
        v_g.slug, v_g.name_vi, v_g.name_en, v_g.icon, v_g.accent,
        v_g.site_url, v_g.prefix || 'rooms');
    end if;
  end loop;

  if v_sql = '' then
    return jsonb_build_object('items', '[]'::jsonb);
  end if;
  execute 'select jsonb_build_object(''items'',
             coalesce(jsonb_agg(i order by i.at desc), ''[]''::jsonb))
      from (
        select kind, slug, name_vi, name_en, icon, accent, at,
               a_handle, a_name, a_avatar, b_handle, b_name,
               result, room_code, join_url
          from (' || v_sql || ') items
         order by at desc
         limit least(greatest(coalesce($1, 20), 1), 50)
      ) i'
    into v_out using p_limit;
  return v_out;
end $$;

-- ================= 10. GRANTS =================
-- Internal helpers stay revoked; public RPCs keep their 001–003 grants
-- (create or replace preserves them — restated here for clarity).
revoke all on function public.hub_agg_fragments() from public;
revoke all on function public.hub_agg_fragments() from anon;
revoke all on function public.hub_game_stat(uuid, text) from public;
revoke all on function public.hub_game_stat(uuid, text) from anon;
revoke all on function public.hub_home() from public;
revoke all on function public.search_profiles(text) from public;
revoke all on function public.hub_sitemap_handles() from public;
revoke all on function public.hub_public_rooms() from public;
revoke all on function public.hub_friends_playing() from public;
revoke all on function public.hub_friends_playing() from anon;
revoke all on function public.hub_activity(int) from public;
grant execute on function public.hub_home() to anon, authenticated;
grant execute on function public.search_profiles(text) to anon, authenticated;
grant execute on function public.hub_sitemap_handles() to anon, authenticated;
grant execute on function public.hub_public_rooms() to anon, authenticated;
grant execute on function public.hub_friends_playing() to authenticated;
grant execute on function public.hub_activity(int) to anon, authenticated;
