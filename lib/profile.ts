"use client";

import { supabaseBrowser } from "./supabase-browser";

/**
 * The shared profiles contract — mirrors lib/supabase/profile.ts in the
 * family games (identical in every game). The shared `profiles` table
 * has NO email column; email always comes from the auth session.
 */
export interface MyProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  birth_date: string | null; // YYYY-MM-DD
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  handle: string | null;
  handle_changed_at: string | null;
  profile_public: boolean;
  referral_code: string | null;
  email: string | null;
}

const SELECT =
  "id, username, full_name, birth_date, avatar_url, city, country, handle, handle_changed_at, profile_public, referral_code";

export async function fetchMyProfile(): Promise<MyProfile | null> {
  const sb = supabaseBrowser();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) return null;
  const { data, error } = await sb
    .from("profiles")
    .select(SELECT)
    .eq("id", session.user.id)
    .maybeSingle();
  if (!error && data) {
    return { ...(data as Omit<MyProfile, "email">), email: session.user.email ?? null };
  }
  // Migration 006 (handle_changed_at) not run yet — fall back to the
  // pre-006 column list so /settings keeps working.
  const legacy = await sb
    .from("profiles")
    .select(
      "id, username, full_name, birth_date, avatar_url, city, country, handle, profile_public, referral_code",
    )
    .eq("id", session.user.id)
    .maybeSingle();
  if (legacy.error || !legacy.data) return null;
  return {
    ...(legacy.data as Omit<MyProfile, "email" | "handle_changed_at">),
    handle_changed_at: null,
    email: session.user.email ?? null,
  };
}

/** Update own profile fields. Returns an error message or null. */
export async function updateMyProfile(
  patch: Partial<
    Pick<
      MyProfile,
      "full_name" | "birth_date" | "avatar_url" | "city" | "country" | "profile_public"
    >
  >,
): Promise<string | null> {
  const sb = supabaseBrowser();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) return "Not logged in";
  const { error } = await sb
    .from("profiles")
    .update(patch)
    .eq("id", session.user.id);
  return error ? error.message : null;
}

/**
 * Upload a new avatar to the shared `avatars` bucket at `<uid>/avatar`
 * (same path the games use) and return its public URL.
 */
export async function uploadAvatar(
  file: File,
): Promise<{ url?: string; error?: string }> {
  const sb = supabaseBrowser();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (!session) return { error: "Not logged in" };
  if (!file.type.startsWith("image/")) return { error: "Not an image file" };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be under 5 MB" };
  const path = `${session.user.id}/avatar`;
  const { error } = await sb.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) return { error: error.message };
  const { data } = sb.storage.from("avatars").getPublicUrl(path);
  return { url: data.publicUrl };
}
