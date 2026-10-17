// Canonical public URLs for the family games (synerworlds.com subdomains,
// live since 2026-10-17). The game_registry rows may still hold the old
// *.vercel.app addresses until the registry SQL is run, so every link the
// hub renders is normalized through here: by slug for bare site URLs, and
// by host-rewrite for pre-built join URLs (path + query preserved).

export const CANONICAL_GAME_URLS: Record<string, string> = {
  xiangqi: "https://cotuong.synerworlds.com",
  chess: "https://chess.synerworlds.com",
  cct: "https://cochieutuong.synerworlds.com",
  coganh: "https://coganh.synerworlds.com",
  conhao: "https://conhao.synerworlds.com",
  oanquan: "https://oanquan.synerworlds.com",
  cangua: "https://cangua.synerworlds.com",
  sudoku: "https://sudoku.synerworlds.com",
  crosswords: "https://crosswords.synerworlds.com",
  wordsearch: "https://wordsearch.synerworlds.com",
};

export function canonicalGameSiteUrl(slug: string, fallback: string): string {
  return CANONICAL_GAME_URLS[slug] ?? fallback;
}

export function canonicalJoinUrl(slug: string, joinUrl: string): string {
  const base = CANONICAL_GAME_URLS[slug];
  if (!base) return joinUrl;
  try {
    const u = new URL(joinUrl);
    const b = new URL(base);
    u.protocol = b.protocol;
    u.host = b.host;
    return u.toString();
  } catch {
    return joinUrl;
  }
}
