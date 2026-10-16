-- 006_hub_handle.sql
-- SynerWorlds: let a signed-in user rename their public handle
-- (/u/<handle>). Handles stay lowercase [a-z0-9] words joined by single
-- hyphens (the hub_slugify convention from 001), 3–24 chars, never a
-- reserved route word, and unique (the profiles_handle_key unique index
-- from 001 is the enforcement; this RPC translates its violation into a
-- friendly error). A 30-day cooldown between renames discourages
-- squatting/impersonation flip-flops; the old handle is released
-- immediately (old /u/<old> links stop resolving — the settings UI
-- warns about exactly that before confirming).
--
-- Idempotent — run in the Dashboard SQL editor.

alter table public.profiles
  add column if not exists handle_changed_at timestamptz;

create or replace function public.hub_set_handle(p_handle text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_new text := lower(trim(coalesce(p_handle, '')));
  v_cur text;
  v_changed timestamptz;
begin
  if v_uid is null then
    raise exception 'login required';
  end if;
  select handle, handle_changed_at into v_cur, v_changed
    from profiles where id = v_uid;
  if not found then
    raise exception 'profile not found';
  end if;
  -- Renaming to the current handle is a harmless no-op (and must not
  -- burn the cooldown).
  if v_new = v_cur then
    return jsonb_build_object('ok', true, 'handle', v_cur, 'unchanged', true);
  end if;
  if char_length(v_new) < 3 or char_length(v_new) > 24
     or v_new !~ '^[a-z0-9]+(-[a-z0-9]+)*$' then
    raise exception 'invalid handle';
  end if;
  if v_new = any (array[
       'admin', 'support', 'help', 'about', 'home', 'index', 'profile',
       'synerworlds', 'synerwork', 'rooms', 'login', 'settings',
       'tim-doi-thu', 'u', 'api', 'games', 'lounge', 'sitemap', 'robots'
     ]) then
    raise exception 'handle is reserved';
  end if;
  if v_changed is not null and v_changed > now() - interval '30 days' then
    raise exception 'handle change too soon';
  end if;
  begin
    update profiles
       set handle = v_new, handle_changed_at = now()
     where id = v_uid;
  exception when unique_violation then
    raise exception 'handle taken';
  end;
  return jsonb_build_object('ok', true, 'handle', v_new);
end $$;

-- ================= GRANTS =================
revoke all on function public.hub_set_handle(text) from public;
revoke all on function public.hub_set_handle(text) from anon;
grant execute on function public.hub_set_handle(text) to authenticated;
