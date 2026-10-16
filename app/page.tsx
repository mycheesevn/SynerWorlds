import Link from "next/link";
import { getHubHome, getPublicRooms, searchProfiles } from "@/lib/data";
import { parseLang, s } from "@/lib/i18n";
import RoomCard from "@/components/RoomCard";

export const revalidate = 60;

function Avatar({
  url,
  name,
  size,
}: {
  url: string | null;
  name: string;
  size?: "lg";
}) {
  return (
    <span className={`avatar${size === "lg" ? " lg" : ""}`} aria-hidden>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" />
      ) : (
        (name || "?").charAt(0).toUpperCase()
      )}
    </span>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const q = (sp.q ?? "").trim();
  const [home, results, rooms] = await Promise.all([
    getHubHome(),
    q ? searchProfiles(q) : Promise.resolve(null),
    getPublicRooms(),
  ]);
  const langQ = lang === "en" ? "&lang=en" : "";
  const withLang = (href: string) =>
    lang === "en" ? `${href}${href.includes("?") ? "&" : "?"}lang=en` : href;

  return (
    <>
      <div style={{ textAlign: "right" }}>
        <span className="lang-switch">
          <a href={`/${q ? `?q=${encodeURIComponent(q)}` : ""}`} className={lang === "vi" ? "on" : ""}>
            VI
          </a>{" "}
          ·{" "}
          <a href={`/?lang=en${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={lang === "en" ? "on" : ""}>
            EN
          </a>
        </span>
      </div>

      <div className="hero">
        <h1>
          Syner<em>Worlds</em>
        </h1>
        <p>{s("tagline", lang)}</p>
        <form className="search-form" method="get" action="/">
          {lang === "en" && <input type="hidden" name="lang" value="en" />}
          <input
            name="q"
            defaultValue={q}
            placeholder={s("searchPlaceholder", lang)}
            aria-label={s("searchPlaceholder", lang)}
          />
          <button type="submit">{s("searchBtn", lang)}</button>
        </form>
      </div>

      {results !== null && (
        <section>
          <h2>
            🔎 {s("searchResults", lang)} “{q}”
          </h2>
          {results.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>{s("noResults", lang)}</p>
          ) : (
            <div className="player-list">
              {results.map((r) => (
                <Link
                  key={r.handle}
                  className="player-row"
                  href={withLang(`/u/${r.handle}`)}
                >
                  <Avatar url={r.avatar_url} name={r.display_name} />
                  <span className="who">
                    <span className="nm">{r.display_name}</span>
                    <br />
                    <span className="hd">@{r.handle}</span>
                  </span>
                  <span className="stats">
                    <b>{r.total_xp.toLocaleString()}</b> XP · {r.games_count}{" "}
                    {s("gamesPlayedOf", lang)}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {rooms.length > 0 && (
        <section>
          <h2>{s("roomsHeading", lang)}</h2>
          <div className="room-grid">
            {rooms.slice(0, 6).map((r) => (
              <RoomCard key={`${r.slug}-${r.code}`} room={r} lang={lang} />
            ))}
          </div>
          <div className="rooms-more">
            <Link href={withLang("/rooms")}>{s("roomsAll", lang)}</Link>
          </div>
        </section>
      )}

      {!home ? (
        <div className="notice">
          <span className="big-emoji">🛠️</span>
          {s("dataPending", lang)}
        </div>
      ) : (
        <>
          <section id="games">
            <h2>{s("gamesHeading", lang)}</h2>
            <div className="game-grid">
              {home.games.map((g) => (
                <div
                  key={g.slug}
                  className="game-card"
                  style={{ borderTopColor: g.accent ?? undefined }}
                >
                  <span className="gc-icon">{g.icon ?? "🎲"}</span>
                  <h3>{lang === "vi" ? g.name_vi : g.name_en}</h3>
                  <p>{lang === "vi" ? g.tagline_vi : g.tagline_en}</p>
                  <span className="gc-meta">
                    👥 {g.players.toLocaleString()} {s("players", lang)}
                  </span>
                  <a
                    className="btn"
                    style={{ background: g.accent ?? undefined }}
                    href={g.site_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s("playNow", lang)}
                  </a>
                </div>
              ))}
            </div>
          </section>

          {home.top_players.length > 0 && (
            <section id="top">
              <h2>{s("topHeading", lang)}</h2>
              <div className="player-list">
                {home.top_players.map((p, i) => (
                  <Link
                    key={p.handle}
                    className="player-row"
                    href={withLang(`/u/${p.handle}`)}
                  >
                    <span className="rank-num">#{i + 1}</span>
                    <Avatar url={p.avatar_url} name={p.display_name} />
                    <span className="who">
                      <span className="nm">{p.display_name}</span>
                      <br />
                      <span className="hd">
                        @{p.handle} · {p.games_count} {s("gamesPlayedOf", lang)}
                        {p.best_rating
                          ? ` · ⭐ ${p.best_rating.toLocaleString()}`
                          : ""}
                      </span>
                    </span>
                    <span className="stats">
                      <b>{p.total_xp.toLocaleString()}</b> XP
                      <br />
                      {p.total_games.toLocaleString()} {s("games", lang)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      <span hidden>{langQ}</span>
    </>
  );
}
