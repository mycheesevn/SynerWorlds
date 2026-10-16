import Link from "next/link";
import {
  getActivity,
  getHubHome,
  getLfgPosts,
  getPublicRooms,
  searchProfiles,
  type ActivityItem,
} from "@/lib/data";
import { parseLang, s, timeAgo, type Lang } from "@/lib/i18n";
import RoomCard from "@/components/RoomCard";
import SynerLogo from "@/components/SynerLogo";
import HandoffLink from "@/components/HandoffLink";
import FriendsPlaying from "@/components/FriendsPlaying";

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
  const [home, results, rooms, activity, lfg] = await Promise.all([
    getHubHome(),
    q ? searchProfiles(q) : Promise.resolve(null),
    getPublicRooms(),
    getActivity(12),
    getLfgPosts(null, 4, 0),
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
        <div className="hero-logo" aria-hidden>
          <SynerLogo size={88} />
        </div>
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

      {!home ? (
        <div className="notice">
          <span className="big-emoji">🛠️</span>
          {s("dataPending", lang)}
        </div>
      ) : (
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
                <HandoffLink
                  className="btn"
                  style={{ background: g.accent ?? undefined }}
                  href={g.site_url}
                  newTab
                >
                  {s("playNow", lang)}
                </HandoffLink>
              </div>
            ))}
          </div>
        </section>

      )}

        {home && home.top_players.length > 0 && (
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
      <FriendsPlaying lang={lang} />

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

      {activity.length > 0 && (
        <section>
          <h2>{s("activityHeading", lang)}</h2>
          <div className="feed-list">
            {activity.map((it, i) => (
              <ActivityRow key={i} item={it} lang={lang} withLang={withLang} />
            ))}
          </div>
        </section>
      )}

      {lfg.posts.length > 0 && (
        <section>
          <h2>{s("lfgLatestHeading", lang)}</h2>
          <div className="feed-list">
            {lfg.posts.map((p) => (
              <div key={p.id} className="feed-item">
                <span className="avatar" aria-hidden>
                  {p.author_avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.author_avatar} alt="" />
                  ) : (
                    p.author_name.charAt(0).toUpperCase()
                  )}
                </span>
                <span className="txt">
                  <Link href={withLang(`/u/${p.author_handle}`)}>
                    {p.author_name}
                  </Link>{" "}
                  · {p.icon ?? "🎲"} {lang === "vi" ? p.name_vi : p.name_en}
                  {p.author_rating
                    ? ` · ⭐ ${p.author_rating.toLocaleString()}`
                    : ""}{" "}
                  — {p.body}
                </span>
                <span className="when">{timeAgo(p.created_at, lang)}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 10 }}>
            <Link href={withLang("/tim-doi-thu")}>
              {s("lfgViewBoard", lang)} →
            </Link>
          </p>
        </section>
      )}

      <span hidden>{langQ}</span>
    </>
  );
}

function ActivityRow({
  item,
  lang,
  withLang,
}: {
  item: ActivityItem;
  lang: Lang;
  withLang: (href: string) => string;
}) {
  const gameName = lang === "vi" ? item.name_vi : item.name_en;
  const a = (
    <Link href={withLang(`/u/${item.a_handle}`)}>{item.a_name}</Link>
  );
  let text: React.ReactNode;
  if (item.kind === "match" && item.b_handle) {
    const b = (
      <Link href={withLang(`/u/${item.b_handle}`)}>{item.b_name}</Link>
    );
    text =
      item.result === "draw" ? (
        <>
          🤝 {a} {lang === "vi" ? "hòa" : "drew with"} {b} · {gameName}
        </>
      ) : (
        <>
          🏆 {a} {lang === "vi" ? "thắng" : "beat"} {b} · {gameName}
        </>
      );
  } else if (item.kind === "ai") {
    text = (
      <>
        ♟️ {a}{" "}
        {item.result === "draw"
          ? lang === "vi"
            ? "vừa hòa máy"
            : "just drew the computer"
          : lang === "vi"
            ? "vừa thắng máy"
            : "just beat the computer"}{" "}
        · {gameName}
      </>
    );
  } else {
    text = (
      <>
        🚪 {a} {lang === "vi" ? "vừa mở phòng" : "just opened a room"} ·{" "}
        {gameName}
      </>
    );
  }
  return (
    <div className="feed-item">
      <span className="avatar" aria-hidden>
        {item.a_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.a_avatar} alt="" />
        ) : (
          item.a_name.charAt(0).toUpperCase()
        )}
      </span>
      <span className="txt">
        {item.icon} {text}
        {item.kind === "room" && item.room_code ? (
          <>
            {" "}
            · <span className="code-chip">{item.room_code}</span>
          </>
        ) : null}
      </span>
      {item.kind === "room" && item.join_url && (
        <HandoffLink
          className="btn"
          style={{ background: item.accent ?? undefined }}
          href={item.join_url}
          newTab
        >
          {s("enterRoom", lang)}
        </HandoffLink>
      )}
      <span className="when">{timeAgo(item.at, lang)}</span>
    </div>
  );
}
