import type { Metadata } from "next";
import Link from "next/link";
import { getHubHome, getPublicRooms } from "@/lib/data";
import { parseLang, s } from "@/lib/i18n";
import RoomCard from "@/components/RoomCard";

export const revalidate = 20;

export const metadata: Metadata = {
  title: "Phòng chơi công khai",
  description:
    "Mọi phòng chơi công khai đang mở ở Cờ Tướng, Cờ Vua, Cờ Chiếu Tướng và Cờ Gánh — bấm vào là vào thẳng phòng.",
};

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ game?: string; lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const gameFilter = (sp.game ?? "").trim();
  const [rooms, home] = await Promise.all([getPublicRooms(), getHubHome()]);
  const games = home?.games ?? [];
  const filtered = gameFilter
    ? rooms.filter((r) => r.slug === gameFilter)
    : rooms;
  const hrefFor = (slug: string, forLang: "vi" | "en" = lang) => {
    const params = new URLSearchParams();
    if (slug) params.set("game", slug);
    if (forLang === "en") params.set("lang", "en");
    const qs = params.toString();
    return `/rooms${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <div style={{ textAlign: "right" }}>
        <span className="lang-switch">
          <a href={hrefFor(gameFilter, "vi")} className={lang === "vi" ? "on" : ""}>
            VI
          </a>{" "}
          ·{" "}
          <a href={hrefFor(gameFilter, "en")} className={lang === "en" ? "on" : ""}>
            EN
          </a>
        </span>
      </div>

      <div className="hero" style={{ paddingTop: 8 }}>
        <h1 style={{ fontSize: 30 }}>{s("roomsPageTitle", lang)}</h1>
        <p>{s("roomsPageSub", lang)}</p>
      </div>

      {games.length > 0 && (
        <nav className="game-filter" aria-label="Filter by game">
          <Link href={hrefFor("")} className={!gameFilter ? "on" : ""}>
            {s("allGames", lang)}
          </Link>
          {games.map((g) => (
            <Link
              key={g.slug}
              href={hrefFor(g.slug)}
              className={gameFilter === g.slug ? "on" : ""}
            >
              {g.icon ?? "🎲"} {lang === "vi" ? g.name_vi : g.name_en}
            </Link>
          ))}
        </nav>
      )}

      {filtered.length === 0 ? (
        <div className="notice">
          <span className="big-emoji">🏠</span>
          {s("roomsEmpty", lang)}
        </div>
      ) : (
        <div className="room-grid">
          {filtered.map((r) => (
            <RoomCard key={`${r.slug}-${r.code}`} room={r} lang={lang} />
          ))}
        </div>
      )}

      <p style={{ marginTop: 22 }}>
        <Link href={`/${lang === "en" ? "?lang=en" : ""}`}>
          {s("backHome", lang)}
        </Link>
      </p>
    </>
  );
}
