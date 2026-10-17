// Server-side data access for the SynerWorlds hub.
// Read-only: three SECURITY DEFINER RPCs on the family's shared
// Supabase project (migration 001_synerworlds_foundation.sql).
// Every call fails soft (null) so pages render a graceful state
// even before the migration has run.

import { canonicalGameSiteUrl, canonicalJoinUrl } from "./gameUrls";

export interface GameStat {
  slug: string;
  name_vi: string;
  name_en: string;
  tagline_vi: string | null;
  tagline_en: string | null;
  site_url: string;
  icon: string | null;
  accent: string | null;
  played: boolean;
  rating: number | null;
  peak_rating: number | null;
  rank: number | null;
  players_total: number | null;
  xp: number | null;
  level: number | null;
  wins: number | null;
  losses: number | null;
  draws: number | null;
  games_played: number | null;
  updated_at: string | null;
}

export interface PublicProfile {
  found: boolean;
  private?: boolean;
  handle?: string;
  display_name?: string;
  avatar_url?: string | null;
  member_since?: string;
  totals?: {
    xp: number;
    games_played: number;
    games_count: number;
    best_rating: number | null;
  };
  games?: GameStat[];
}

export interface HubGame {
  slug: string;
  name_vi: string;
  name_en: string;
  tagline_vi: string | null;
  tagline_en: string | null;
  site_url: string;
  icon: string | null;
  accent: string | null;
  players: number;
}

export interface TopPlayer {
  handle: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  games_count: number;
  total_games: number;
  best_rating: number | null;
}

export interface HubHome {
  games: HubGame[];
  top_players: TopPlayer[];
}

export interface SearchResult {
  handle: string;
  display_name: string;
  avatar_url: string | null;
  games_count: number;
  total_xp: number;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

async function rpc<T>(
  fn: string,
  args?: Record<string, unknown>,
  revalidateSec = 60,
): Promise<T | null> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args ?? {}),
      next: { revalidate: revalidateSec },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getPublicProfile(
  handle: string,
): Promise<PublicProfile | null> {
  const out = await rpc<PublicProfile>("get_public_profile", {
    p_handle: handle,
  });
  if (out?.games) {
    out.games = out.games.map((g) => ({
      ...g,
      site_url: canonicalGameSiteUrl(g.slug, g.site_url),
    }));
  }
  return out;
}

export async function getHubHome(): Promise<HubHome | null> {
  const out = await rpc<HubHome>("hub_home");
  if (out?.games) {
    out.games = out.games.map((g) => ({
      ...g,
      site_url: canonicalGameSiteUrl(g.slug, g.site_url),
    }));
  }
  return out;
}

export interface HubRoom {
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  accent: string | null;
  code: string;
  name: string;
  member_count: number;
  max_players: number;
  has_active_match: boolean;
  join_url: string;
}

export async function getPublicRooms(): Promise<HubRoom[]> {
  const out = await rpc<{ rooms: HubRoom[] }>("hub_public_rooms", {}, 20);
  return (out?.rooms ?? []).map((r) => ({
    ...r,
    join_url: canonicalJoinUrl(r.slug, r.join_url),
  }));
}

export interface ActivityItem {
  kind: "match" | "ai" | "room";
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  accent: string | null;
  at: string;
  a_handle: string;
  a_name: string;
  a_avatar: string | null;
  b_handle: string | null;
  b_name: string | null;
  result: "win" | "draw" | null;
  room_code: string | null;
  join_url: string | null;
}

export async function getActivity(limit = 12): Promise<ActivityItem[]> {
  const out = await rpc<{ items: ActivityItem[] }>(
    "hub_activity",
    { p_limit: limit },
    30,
  );
  return (out?.items ?? []).map((i) =>
    i.join_url
      ? { ...i, join_url: canonicalJoinUrl(i.slug, i.join_url) }
      : i,
  );
}

export interface LfgPost {
  id: string;
  body: string;
  created_at: string;
  expires_at: string;
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  accent: string | null;
  author_handle: string;
  author_name: string;
  author_avatar: string | null;
  author_rating: number | null;
  mine: boolean;
}

export async function getLfgPosts(
  slug: string | null = null,
  limit = 10,
  offset = 0,
): Promise<{ total: number; posts: LfgPost[] }> {
  const out = await rpc<{ total: number; posts: LfgPost[] }>(
    "hub_lfg_list",
    { p_slug: slug, p_limit: limit, p_offset: offset },
    20,
  );
  return out ?? { total: 0, posts: [] };
}

export async function searchProfiles(q: string): Promise<SearchResult[]> {
  const out = await rpc<{ results: SearchResult[] }>("search_profiles", { p_q: q });
  return out?.results ?? [];
}

export async function getSitemapHandles(): Promise<string[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/hub_sitemap_handles`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as unknown;
    if (!Array.isArray(rows)) return [];
    return rows
      .map((r) =>
        typeof r === "string"
          ? r
          : (r as { hub_sitemap_handles?: string })?.hub_sitemap_handles ?? "",
      )
      .filter(Boolean);
  } catch {
    return [];
  }
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://synerworlds.com"
  );
}
