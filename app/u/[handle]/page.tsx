import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublicProfile, siteUrl, type GameStat } from "@/lib/data";
import { fmtDate, parseLang, ratingTitle, s } from "@/lib/i18n";
import ShareButton from "@/components/ShareButton";
import ChallengeButton from "@/components/ChallengeButton";
import Guestbook from "@/components/Guestbook";

export const revalidate = 60;

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const p = await getPublicProfile(handle);
  if (!p || !p.found) {
    return { title: s("profileNotFound", lang) };
  }
  const name = p.display_name ?? handle;
  const totals = p.private ? null : p.totals;
  const desc = totals
    ? `${s("profileOf", lang)}: ${name} (@${p.handle}) — ${totals.games_count} ${s("gamesPlayedOf", lang)} · ${totals.xp.toLocaleString()} XP${totals.best_rating ? ` · ⭐ ${totals.best_rating}` : ""}`
    : `${s("profileOf", lang)}: ${name} (@${p.handle})`;
  const og = `${siteUrl()}/api/og/${encodeURIComponent(p.handle ?? handle)}`;
  return {
    title: `${name} (@${p.handle})`,
    description: desc,
    openGraph: {
      title: `${name} · SynerWorlds`,
      description: desc,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title: `${name} · SynerWorlds`, description: desc, images: [og] },
  };
}

function AvatarLg({ url, name }: { url: string | null | undefined; name: string }) {
  return (
    <span className="avatar lg" aria-hidden>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" />
      ) : (
        (name || "?").charAt(0).toUpperCase()
      )}
    </span>
  );
}

function GameCard({ g, lang }: { g: GameStat; lang: "vi" | "en" }) {
  const name = lang === "vi" ? g.name_vi : g.name_en;
  const tagline = lang === "vi" ? g.tagline_vi : g.tagline_en;
  if (!g.played) {
    return (
      <div className="stat-card unplayed">
        <div className="sc-head">
          <span className="ic">{g.icon ?? "🎲"}</span>
          <h3>{name}</h3>
          <span className="tag">{s("notPlayedYet", lang)}</span>
        </div>
        {tagline && <div className="sc-detail">{tagline}</div>}
        <div className="sc-actions">
          <a
            className="btn ghost"
            href={g.site_url}
            target="_blank"
            rel="noreferrer"
          >
            {s("tryNow", lang)}
          </a>
        </div>
      </div>
    );
  }
  const record =
    g.wins !== null && g.losses !== null && g.draws !== null
      ? `${s("record", lang)}: ${g.wins}–${g.draws}–${g.losses}`
      : g.wins !== null
        ? `${g.wins} ${lang === "vi" ? "thắng" : "wins"}`
        : "";
  return (
    <div
      className="stat-card"
      style={{ borderLeftColor: g.accent ?? undefined }}
    >
      <div className="sc-head">
        <span className="ic">{g.icon ?? "🎲"}</span>
        <h3>{name}</h3>
        <span className="tag">
          {s("level", lang)} {g.level} · {g.xp?.toLocaleString()} XP
        </span>
        <span className="spacer" />
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
      <div className="sc-rating">
        <span className="big">{g.rating?.toLocaleString()}</span>
        <span className="band">{ratingTitle(g.rating ?? 0, lang)}</span>
        {g.rank !== null && (
          <span className="rk">
            🏆 {s("rank", lang)} {g.rank}
            {g.players_total ? ` / ${g.players_total} ${s("ofPlayers", lang)}` : ""}
          </span>
        )}
      </div>
      <div className="sc-detail">
        {s("peak", lang)}: {g.peak_rating?.toLocaleString()}
        {record ? ` · ${record}` : ""} ·{" "}
        {g.games_played?.toLocaleString()} {s("games", lang)}
        {g.updated_at
          ? ` · ${s("lastPlayed", lang)}: ${fmtDate(g.updated_at, lang)}`
          : ""}
      </div>
    </div>
  );
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { handle } = await params;
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const p = await getPublicProfile(handle);

  if (p && !p.found) notFound();
  if (!p) {
    return (
      <div className="notice">
        <span className="big-emoji">🛠️</span>
        {s("dataPending", lang)}
        <div style={{ marginTop: 12 }}>
          <Link href="/">{s("backHome", lang)}</Link>
        </div>
      </div>
    );
  }

  const name = p.display_name ?? p.handle ?? handle;
  const profileUrl = `${siteUrl()}/u/${p.handle}`;

  if (p.private) {
    return (
      <>
        <div className="profile-head">
          <AvatarLg url={p.avatar_url} name={name} />
          <div className="who">
            <h1>{name}</h1>
            <div className="handle">@{p.handle}</div>
          </div>
        </div>
        <div className="notice">
          <span className="big-emoji">🔒</span>
          {s("profilePrivate", lang)}
          <div style={{ marginTop: 12 }}>
            <Link href="/">{s("backHome", lang)}</Link>
          </div>
        </div>
        <Guestbook handle={p.handle ?? handle} lang={lang} />
      </>
    );
  }

  const totals = p.totals!;
  const langSuffix = lang === "en" ? "?lang=en" : "";
  return (
    <>
      <div style={{ textAlign: "right" }}>
        <span className="lang-switch">
          <a href={`/u/${p.handle}`} className={lang === "vi" ? "on" : ""}>
            VI
          </a>{" "}
          ·{" "}
          <a
            href={`/u/${p.handle}?lang=en`}
            className={lang === "en" ? "on" : ""}
          >
            EN
          </a>
        </span>
      </div>

      <div className="profile-head">
        <AvatarLg url={p.avatar_url} name={name} />
        <div className="who">
          <h1>{name}</h1>
          <div className="handle">@{p.handle}</div>
          <div className="since">
            📅 {s("memberSince", lang)} {fmtDate(p.member_since, lang)}
          </div>
        </div>
        <ShareButton
          url={profileUrl}
          title={`${name} · SynerWorlds`}
          shareLabel={s("share", lang)}
          copyLabel={s("copyLink", lang)}
          copiedLabel={s("copied", lang)}
        />
        <ChallengeButton
          handle={p.handle ?? handle}
          games={(p.games ?? []).map((g) => ({
            slug: g.slug,
            name_vi: g.name_vi,
            name_en: g.name_en,
            icon: g.icon,
            accent: g.accent,
            site_url: g.site_url,
            played: g.played,
            rating: g.rating,
          }))}
          lang={lang}
        />
      </div>

      <div className="totals-strip">
        <div className="total-cell">
          <div className="v">{totals.xp.toLocaleString()}</div>
          <div className="k">{s("totalXp", lang)}</div>
        </div>
        <div className="total-cell">
          <div className="v">
            {totals.games_count}/{(p.games ?? []).length}
          </div>
          <div className="k">{s("gamesPlayedOf", lang)}</div>
        </div>
        <div className="total-cell">
          <div className="v">
            {totals.best_rating ? totals.best_rating.toLocaleString() : "—"}
          </div>
          <div className="k">{s("bestRating", lang)}</div>
        </div>
        <div className="total-cell">
          <div className="v">{totals.games_played.toLocaleString()}</div>
          <div className="k">{s("totalGames", lang)}</div>
        </div>
      </div>

      <section>
        {(p.games ?? []).map((g) => (
          <GameCard key={g.slug} g={g} lang={lang} />
        ))}
      </section>

      <Guestbook handle={p.handle ?? handle} lang={lang} />

      <p style={{ marginTop: 22 }}>
        <Link href={`/${langSuffix}`}>{s("backHome", lang)}</Link>
      </p>
    </>
  );
}
