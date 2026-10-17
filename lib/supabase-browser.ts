"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Browser-side Supabase client (same shared project as the games —
// one account works everywhere). Used only for Auth + the
// authenticated hub_friends_playing RPC; all public data stays on
// server components via lib/data.ts.
let client: SupabaseClient | null = null;

/**
 * Shared session cookie: on the family domains the Supabase session
 * cookie is scoped to .synerworlds.com, so signing in on ANY family
 * site (hub or any game) signs the player in on ALL of them — no
 * hand-off needed for ordinary navigation. Elsewhere (localhost dev,
 * legacy domains) the cookie stays host-only, exactly as before.
 */
function familyCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.hostname.endsWith("synerworlds.com")
    ? ".synerworlds.com"
    : undefined;
}

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      { cookieOptions: { domain: familyCookieDomain() } },
    );
  }
  return client;
}
