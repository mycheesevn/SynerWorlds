-- 002_hub_public_rooms.sql
-- SynerWorlds: aggregate the PUBLIC rooms of every family game into one
-- feed for the portal home + /rooms page.
--
-- Every game already exposes a public-rooms RPC with the SAME shape
-- (id, code, name, member_count, max_players, has_active_match):
--   xiangqi → list_public_rooms()        (the original, PacClone)
--   chess   → chess_list_public_rooms()
--   cct     → cct_list_public_rooms()
--   coganh  → cg_list_public_rooms()
-- This migration only UNIONs them and tags each room with its game's
-- registry metadata + a join deep link (<site>/?room=<CODE> — the games
-- already honor that query param). NO game needs any change.
--
-- A future game appears here by (a) exposing its own
-- <prefix>_list_public_rooms() with the family shape, (b) one
-- game_registry row, and (c) one more UNION ALL branch below.
-- Idempotent — run in the Dashboard SQL editor.

create or replace function public.hub_public_rooms()
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('rooms', coalesce(jsonb_agg(r order by r.has_active_match desc, r.member_count desc), '[]'::jsonb))
    from (
      select g.slug, g.name_vi, g.name_en, g.icon, g.accent,
             r.code, r.name, r.member_count, r.max_players, r.has_active_match,
             g.site_url || '/?room=' || r.code as join_url
        from public.list_public_rooms() r
        join public.game_registry g on g.slug = 'xiangqi' and g.active
      union all
      select g.slug, g.name_vi, g.name_en, g.icon, g.accent,
             r.code, r.name, r.member_count, r.max_players, r.has_active_match,
             g.site_url || '/?room=' || r.code as join_url
        from public.chess_list_public_rooms() r
        join public.game_registry g on g.slug = 'chess' and g.active
      union all
      select g.slug, g.name_vi, g.name_en, g.icon, g.accent,
             r.code, r.name, r.member_count, r.max_players, r.has_active_match,
             g.site_url || '/?room=' || r.code as join_url
        from public.cct_list_public_rooms() r
        join public.game_registry g on g.slug = 'cct' and g.active
      union all
      select g.slug, g.name_vi, g.name_en, g.icon, g.accent,
             r.code, r.name, r.member_count, r.max_players, r.has_active_match,
             g.site_url || '/?room=' || r.code as join_url
        from public.cg_list_public_rooms() r
        join public.game_registry g on g.slug = 'coganh' and g.active
    ) r
$$;

revoke all on function public.hub_public_rooms() from public;
grant execute on function public.hub_public_rooms() to anon, authenticated;
