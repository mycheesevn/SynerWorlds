"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { HubGame, LfgPost } from "@/lib/data";
import { s, timeAgo, type Lang } from "@/lib/i18n";
import { socialError } from "@/lib/social";
import HandoffLink from "@/components/HandoffLink";

const PAGE = 10;
const HOURS = [6, 12, 24, 48];

function expiresIn(iso: string, lang: Lang): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return lang === "vi" ? "sắp hết hạn" : "expiring";
  const h = ms / 3600000;
  if (h >= 24) {
    const d = Math.round(h / 24);
    return lang === "vi" ? `còn ${d} ngày` : `${d}d left`;
  }
  return lang === "vi" ? `còn ${Math.ceil(h)} giờ` : `${Math.ceil(h)}h left`;
}

export default function LfgBoard({
  lang,
  games,
  initial,
}: {
  lang: Lang;
  games: HubGame[];
  initial: { total: number; posts: LfgPost[] };
}) {
  const [posts, setPosts] = useState<LfgPost[]>(initial.posts);
  const [total, setTotal] = useState(initial.total);
  const [page, setPage] = useState(0);
  const [filter, setFilter] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [slug, setSlug] = useState(games[0]?.slug ?? "");
  const [body, setBody] = useState("");
  const [hours, setHours] = useState(12);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const firstLoad = useRef(true);

  const load = useCallback(async (f: string | null, pg: number) => {
    const { data, error } = await supabaseBrowser().rpc("hub_lfg_list", {
      p_slug: f,
      p_limit: PAGE,
      p_offset: pg * PAGE,
    });
    if (!error && data) {
      const d = data as { total: number; posts: LfgPost[] };
      setPosts(d.posts);
      setTotal(d.total);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabaseBrowser().auth.getSession();
      setLoggedIn(!!session);
    })();
  }, []);

  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    load(filter, page);
  }, [filter, page, load]);

  const pages = Math.max(1, Math.ceil(total / PAGE));
  const siteBySlug = new Map(games.map((g) => [g.slug, g.site_url]));

  const post = async () => {
    setErr("");
    setBusy(true);
    const { error } = await supabaseBrowser().rpc("hub_lfg_post", {
      p_slug: slug,
      p_body: body,
      p_hours: hours,
    });
    setBusy(false);
    if (error) {
      setErr(socialError(error, lang));
      return;
    }
    setBody("");
    setFilter(null);
    setPage(0);
    load(null, 0);
  };

  const close = async (p: LfgPost) => {
    setErr("");
    const { error } = await supabaseBrowser().rpc("hub_lfg_delete", {
      p_id: p.id,
    });
    if (error) {
      setErr(socialError(error, lang));
      return;
    }
    load(filter, page);
  };

  return (
    <>
      <div className="lfg-filters">
        <button
          type="button"
          className={`chip${filter === null ? " on" : ""}`}
          onClick={() => {
            setFilter(null);
            setPage(0);
          }}
        >
          {s("lfgAllGames", lang)}
        </button>
        {games.map((g) => (
          <button
            key={g.slug}
            type="button"
            className={`chip${filter === g.slug ? " on" : ""}`}
            onClick={() => {
              setFilter(g.slug);
              setPage(0);
            }}
          >
            {g.icon ?? "🎲"} {lang === "vi" ? g.name_vi : g.name_en}
          </button>
        ))}
      </div>

      {!loggedIn ? (
        <p>
          <Link className="btn ghost" href="/login">
            {s("lfgLoginCta", lang)}
          </Link>
        </p>
      ) : (
        <div className="lfg-composer">
          <div className="lfg-composer-row">
            <label>
              {s("lfgGameLabel", lang)}
              <select value={slug} onChange={(e) => setSlug(e.target.value)}>
                {games.map((g) => (
                  <option key={g.slug} value={g.slug}>
                    {g.icon ?? "🎲"} {lang === "vi" ? g.name_vi : g.name_en}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {s("lfgHoursLabel", lang)}
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              >
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}h
                  </option>
                ))}
              </select>
            </label>
          </div>
          <textarea
            value={body}
            maxLength={200}
            rows={2}
            placeholder={s("lfgPlaceholder", lang)}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="gb-composer-row">
            <span className="gb-count">{body.length}/200</span>
            <button
              type="button"
              className="btn"
              disabled={busy || body.trim().length === 0}
              onClick={post}
            >
              {s("lfgPostBtn", lang)}
            </button>
          </div>
        </div>
      )}

      {err && (
        <p className="set-error" role="alert">
          {err}
        </p>
      )}

      {posts.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>{s("lfgEmpty", lang)}</p>
      ) : (
        <div className="gb-list">
          {posts.map((p) => (
            <div key={p.id} className="gb-entry">
              <span className="avatar" aria-hidden>
                {p.author_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.author_avatar} alt="" />
                ) : (
                  p.author_name.charAt(0).toUpperCase()
                )}
              </span>
              <div className="gb-main">
                <div className="gb-head">
                  <Link href={`/u/${p.author_handle}`} className="nm">
                    {p.author_name}
                  </Link>
                  <span
                    className="game-chip"
                    style={{ borderColor: p.accent ?? undefined }}
                  >
                    {p.icon ?? "🎲"} {lang === "vi" ? p.name_vi : p.name_en}
                  </span>
                  {p.author_rating ? (
                    <span className="rk">⭐ {p.author_rating.toLocaleString()}</span>
                  ) : null}
                  <span className="when">
                    {timeAgo(p.created_at, lang)} · {expiresIn(p.expires_at, lang)}
                  </span>
                </div>
                <p className="gb-body">{p.body}</p>
                <div className="gb-actions">
                  {p.mine ? (
                    <button
                      type="button"
                      className="btn ghost"
                      onClick={() => close(p)}
                    >
                      {s("lfgClose", lang)}
                    </button>
                  ) : (
                    <HandoffLink
                      className="btn"
                      style={{ background: p.accent ?? undefined }}
                      href={`${siteBySlug.get(p.slug) ?? ""}/?challenge=${encodeURIComponent(p.author_handle)}`}
                    >
                      {s("challengeBtn", lang)}
                    </HandoffLink>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="pager">
          <button
            type="button"
            className="btn ghost"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            ←
          </button>
          <span>
            {page + 1} / {pages}
          </span>
          <button
            type="button"
            className="btn ghost"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      )}
    </>
  );
}
