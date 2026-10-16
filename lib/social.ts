import { s, type Lang } from "./i18n";

/** The family reaction set (same emojis as the games' match reactions). */
export const GUESTBOOK_EMOJIS = ["👏", "🔥", "😱", "👍", "😮"];

/** Map a hub social RPC error to a localized, user-friendly line. */
export function socialError(err: unknown, lang: Lang): string {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes("play at least one game")) return s("needPlayError", lang);
  if (raw.includes("too many messages")) return s("slowDownError", lang);
  if (raw.includes("2 active posts")) return s("lfgCapError", lang);
  if (raw.includes("login required")) return s("guestbookLoginCta", lang);
  return raw;
}
