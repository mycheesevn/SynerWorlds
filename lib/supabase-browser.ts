"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Browser-side Supabase client (same shared project as the games —
// one account works everywhere). Used only for Auth + the
// authenticated hub_friends_playing RPC; all public data stays on
// server components via lib/data.ts.
let client: SupabaseClient | null = null;

export function supabaseBrowser(): SupabaseClient {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
      { auth: { persistSession: true, autoRefreshToken: true } },
    );
  }
  return client;
}
