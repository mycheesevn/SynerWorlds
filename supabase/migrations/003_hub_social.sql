-- 003_hub_social.sql
-- SynerWorlds social layer:
--   1. hub_friends_playing() — for the signed-in viewer: people they
--      FOLLOW (the shared one-way `friendships` graph) who are
--      currently inside a non-closed room in any game, with a join
--      deep link. Mirrors the games' own Friends tab, which already
--      shows friends' in-match rooms. Authenticated only.
--   2. hub_activity(p_limit) — public cross-game activity feed:
--      finished human-vs-human room matches, wins/draws vs the
--      computer, and newly opened public rooms (last 24h). Only
--      players with a public profile appear. Anon-safe.
--
-- All four games share the same room/match/member/games shapes
-- (per-game color column names differ in *_room_matches — handled by
-- the per-game branches). NO game needs any change.
-- Idempotent — run in the Dashboard SQL editor.

-- ================= 1. FRIENDS PLAYING NOW =================
create or replace function public.hub_friends_playing()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('authed', false, 'friends', '[]'::jsonb);
  end if;
  return (
    select jsonb_build_object('authed', true, 'friends',
             coalesce(jsonb_agg(f order by f.has_active_match desc, f.joined_at desc), '[]'::jsonb))
      from (
        select distinct on (c.friend_id)
               c.friend_id, fp.handle,
               coalesce(nullif(fp.full_name, ''), nullif(fp.username, ''), 'Player') as display_name,
               fp.avatar_url, c.slug, c.name_vi, c.name_en, c.icon, c.accent,
               c.room_code, c.room_name, c.has_active_match, c.join_url, c.joined_at
          from (
            select fr.friend_id, g.slug, g.name_vi, g.name_en, g.icon, g.accent,
                   r.code as room_code, r.name as room_name,
                   exists (select 1 from room_matches mt
                            where mt.room_id = r.id and mt.status = 'active') as has_active_match,
                   g.site_url || '/?room=' || r.code as join_url, m.joined_at
              from friendships fr
              join room_members m on m.user_id = fr.friend_id
              join rooms r on r.id = m.room_id and r.status <> 'closed'
              join game_registry g on g.slug = 'xiangqi' and g.active
             where fr.user_id = v_uid
            union all
            select fr.friend_id, g.slug, g.name_vi, g.name_en, g.icon, g.accent,
                   r.code, r.name,
                   exists (select 1 from chess_room_matches mt
                            where mt.room_id = r.id and mt.status = 'active'),
                   g.site_url || '/?room=' || r.code, m.joined_at
              from friendships fr
              join chess_room_members m on m.user_id = fr.friend_id
              join chess_rooms r on r.id = m.room_id and r.status <> 'closed'
              join game_registry g on g.slug = 'chess' and g.active
             where fr.user_id = v_uid
            union all
            select fr.friend_id, g.slug, g.name_vi, g.name_en, g.icon, g.accent,
                   r.code, r.name,
                   exists (select 1 from cct_room_matches mt
                            where mt.room_id = r.id and mt.status = 'active'),
                   g.site_url || '/?room=' || r.code, m.joined_at
              from friendships fr
              join cct_room_members m on m.user_id = fr.friend_id
              join cct_rooms r on r.id = m.room_id and r.status <> 'closed'
              join game_registry g on g.slug = 'cct' and g.active
             where fr.user_id = v_uid
            union all
            select fr.friend_id, g.slug, g.name_vi, g.name_en, g.icon, g.accent,
                   r.code, r.name,
                   exists (select 1 from cg_room_matches mt
                            where mt.room_id = r.id and mt.status = 'active'),
                   g.site_url || '/?room=' || r.code, m.joined_at
              from friendships fr
              join cg_room_members m on m.user_id = fr.friend_id
              join cg_rooms r on r.id = m.room_id and r.status <> 'closed'
              join game_registry g on g.slug = 'coganh' and g.active
             where fr.user_id = v_uid
          ) c
          join profiles fp on fp.id = c.friend_id
         order by c.friend_id, c.has_active_match desc, c.joined_at desc
      ) f);
end $$;

revoke all on function public.hub_friends_playing() from public;
revoke all on function public.hub_friends_playing() from anon;
grant execute on function public.hub_friends_playing() to authenticated;

-- ================= 2. ACTIVITY FEED =================
create or replace function public.hub_activity(p_limit int default 20)
returns jsonb
language sql stable security definer set search_path = public as $$
  with items as (
    -- finished human-vs-human room matches (both players public)
    select 'match'::text as kind, g.slug, g.name_vi, g.name_en, g.icon, g.accent,
           coalesce(mt.finished_at, mt.created_at) as at,
           wp.handle as a_handle,
           coalesce(nullif(wp.full_name, ''), nullif(wp.username, ''), 'Player') as a_name,
           wp.avatar_url as a_avatar,
           lp.handle as b_handle,
           coalesce(nullif(lp.full_name, ''), nullif(lp.username, ''), 'Player') as b_name,
           case when mt.winner_id is null then 'draw' else 'win' end as result,
           null::text as room_code, null::text as join_url
      from room_matches mt
      join rooms r on r.id = mt.room_id
      join game_registry g on g.slug = 'xiangqi' and g.active
      join profiles wp on wp.id = coalesce(mt.winner_id, mt.red_id)
      join profiles lp on lp.id = case when mt.winner_id is null then mt.black_id when mt.winner_id = mt.red_id then mt.black_id else mt.red_id end
     where mt.status = 'finished' and mt.red_id is not null and mt.black_id is not null
       and wp.profile_public and wp.handle is not null
       and lp.profile_public and lp.handle is not null
    union all
    select 'match', g.slug, g.name_vi, g.name_en, g.icon, g.accent,
           coalesce(mt.finished_at, mt.created_at),
           wp.handle, coalesce(nullif(wp.full_name, ''), nullif(wp.username, ''), 'Player'), wp.avatar_url,
           lp.handle, coalesce(nullif(lp.full_name, ''), nullif(lp.username, ''), 'Player'),
           case when mt.winner_id is null then 'draw' else 'win' end, null, null
      from chess_room_matches mt
      join chess_rooms r on r.id = mt.room_id
      join game_registry g on g.slug = 'chess' and g.active
      join profiles wp on wp.id = coalesce(mt.winner_id, mt.white_id)
      join profiles lp on lp.id = case when mt.winner_id is null then mt.black_id when mt.winner_id = mt.white_id then mt.black_id else mt.white_id end
     where mt.status = 'finished' and mt.white_id is not null and mt.black_id is not null
       and wp.profile_public and wp.handle is not null
       and lp.profile_public and lp.handle is not null
    union all
    select 'match', g.slug, g.name_vi, g.name_en, g.icon, g.accent,
           coalesce(mt.finished_at, mt.created_at),
           wp.handle, coalesce(nullif(wp.full_name, ''), nullif(wp.username, ''), 'Player'), wp.avatar_url,
           lp.handle, coalesce(nullif(lp.full_name, ''), nullif(lp.username, ''), 'Player'),
           case when mt.winner_id is null then 'draw' else 'win' end, null, null
      from cct_room_matches mt
      join cct_rooms r on r.id = mt.room_id
      join game_registry g on g.slug = 'cct' and g.active
      join profiles wp on wp.id = coalesce(mt.winner_id, mt.red_id)
      join profiles lp on lp.id = case when mt.winner_id is null then mt.green_id when mt.winner_id = mt.red_id then mt.green_id else mt.red_id end
     where mt.status = 'finished' and mt.red_id is not null and mt.green_id is not null
       and wp.profile_public and wp.handle is not null
       and lp.profile_public and lp.handle is not null
    union all
    select 'match', g.slug, g.name_vi, g.name_en, g.icon, g.accent,
           coalesce(mt.finished_at, mt.created_at),
           wp.handle, coalesce(nullif(wp.full_name, ''), nullif(wp.username, ''), 'Player'), wp.avatar_url,
           lp.handle, coalesce(nullif(lp.full_name, ''), nullif(lp.username, ''), 'Player'),
           case when mt.winner_id is null then 'draw' else 'win' end, null, null
      from cg_room_matches mt
      join cg_rooms r on r.id = mt.room_id
      join game_registry g on g.slug = 'coganh' and g.active
      join profiles wp on wp.id = coalesce(mt.winner_id, mt.blue_id)
      join profiles lp on lp.id = case when mt.winner_id is null then mt.red_id when mt.winner_id = mt.blue_id then mt.red_id else mt.blue_id end
     where mt.status = 'finished' and mt.blue_id is not null and mt.red_id is not null
       and wp.profile_public and wp.handle is not null
       and lp.profile_public and lp.handle is not null
    union all
    -- wins/draws vs the computer
    select 'ai', g.slug, g.name_vi, g.name_en, g.icon, g.accent, gm.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, gm.result, null, null
      from games gm
      join profiles p on p.id = gm.user_id
      join game_registry g on g.slug = 'xiangqi' and g.active
     where gm.result in ('win', 'draw') and p.profile_public and p.handle is not null
    union all
    select 'ai', g.slug, g.name_vi, g.name_en, g.icon, g.accent, gm.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, gm.result, null, null
      from chess_games gm
      join profiles p on p.id = gm.user_id
      join game_registry g on g.slug = 'chess' and g.active
     where gm.result in ('win', 'draw') and gm.player_color <> 'cvc'
       and p.profile_public and p.handle is not null
    union all
    select 'ai', g.slug, g.name_vi, g.name_en, g.icon, g.accent, gm.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, gm.result, null, null
      from cct_games gm
      join profiles p on p.id = gm.user_id
      join game_registry g on g.slug = 'cct' and g.active
     where gm.result in ('win', 'draw') and p.profile_public and p.handle is not null
    union all
    select 'ai', g.slug, g.name_vi, g.name_en, g.icon, g.accent, gm.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, gm.result, null, null
      from cg_games gm
      join profiles p on p.id = gm.user_id
      join game_registry g on g.slug = 'coganh' and g.active
     where gm.result in ('win', 'draw') and p.profile_public and p.handle is not null
    union all
    -- newly opened public rooms (last 24 hours)
    select 'room', g.slug, g.name_vi, g.name_en, g.icon, g.accent, r.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, null, r.code, g.site_url || '/?room=' || r.code
      from rooms r
      join profiles p on p.id = r.leader_id
      join game_registry g on g.slug = 'xiangqi' and g.active
     where r.is_public and r.status <> 'closed'
       and r.created_at > now() - interval '24 hours'
       and p.profile_public and p.handle is not null
    union all
    select 'room', g.slug, g.name_vi, g.name_en, g.icon, g.accent, r.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, null, r.code, g.site_url || '/?room=' || r.code
      from chess_rooms r
      join profiles p on p.id = r.leader_id
      join game_registry g on g.slug = 'chess' and g.active
     where r.is_public and r.status <> 'closed'
       and r.created_at > now() - interval '24 hours'
       and p.profile_public and p.handle is not null
    union all
    select 'room', g.slug, g.name_vi, g.name_en, g.icon, g.accent, r.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, null, r.code, g.site_url || '/?room=' || r.code
      from cct_rooms r
      join profiles p on p.id = r.leader_id
      join game_registry g on g.slug = 'cct' and g.active
     where r.is_public and r.status <> 'closed'
       and r.created_at > now() - interval '24 hours'
       and p.profile_public and p.handle is not null
    union all
    select 'room', g.slug, g.name_vi, g.name_en, g.icon, g.accent, r.created_at,
           p.handle, coalesce(nullif(p.full_name, ''), nullif(p.username, ''), 'Player'), p.avatar_url,
           null, null, null, r.code, g.site_url || '/?room=' || r.code
      from cg_rooms r
      join profiles p on p.id = r.leader_id
      join game_registry g on g.slug = 'coganh' and g.active
     where r.is_public and r.status <> 'closed'
       and r.created_at > now() - interval '24 hours'
       and p.profile_public and p.handle is not null
  )
  select jsonb_build_object('items', coalesce(jsonb_agg(i order by i.at desc), '[]'::jsonb))
    from (
      select kind, slug, name_vi, name_en, icon, accent, at,
             a_handle, a_name, a_avatar, b_handle, b_name, result, room_code, join_url
        from items
       order by at desc
       limit least(greatest(coalesce(p_limit, 20), 1), 50)
    ) i
$$;

revoke all on function public.hub_activity(int) from public;
grant execute on function public.hub_activity(int) to anon, authenticated;
