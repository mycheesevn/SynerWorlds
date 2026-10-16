"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { s, timeAgo, type Lang } from "@/lib/i18n";
import { GUESTBOOK_EMOJIS, socialError } from "@/lib/social";

interface GbReaction {
  emoji: string;
  count: number;
  mine: boolean;
}
interface GbEntry {
  id: string;
  body: string;
  created_at: string;
  author_handle: string | null;
  author_name: string;
  author_avatar: string | null;
  reactions: GbReaction[];
  can_delete: boolean;
}
interface GbData {
  found: boolean;
  private?: boolean;
  total: number;
  entries: GbEntry[];
}

const PAGE = 10;

export default function Guestbook({
  handle,
  lang,
}: {
  handle: string;
  lang: Lang;
}) {
  const [data, setData] = useState<GbData | null>(null);
  const [page, setPage] = useState(0);
  const [myHandle, setMyHandle] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(
    async (pg: number) => {
      const { data, error } = await supabaseBrowser().rpc("hub_guestbook_list", {
        p_handle: handle,
        p_limit: PAGE,
        p_offset: pg * PAGE,
      });
      if (!error && data) setData(data as GbData);
    },
    [handle],
  );

  useEffect(() => {
    load(0);
    (async () => {
      const sb = supabaseBrowser();
      const {
        data: { session },
      } = await sb.auth.getSession();
      setLoggedIn(!!session);
      if (session) {
        const { data } = await sb
          .from("profiles")
          .select("handle")
          .eq("id", session.user.id)
          .single();
        setMyHandle(data?.handle ?? null);
      }
    })();
  }, [load]);

  if (!data || data.private || !data.found) return null;

  const isOwner = myHandle !== null && myHandle === handle;
  const pages = Math.max(1, Math.ceil(data.total / PAGE));

  const post = async () => {
    setErr("");
    setBusy(true);
    const { error } = await supabaseBrowser().rpc("hub_guestbook_post", {
      p_handle: handle,
      p_body: body,
    });
    setBusy(false);
    if (error) {
      setErr(socialError(error, lang));
      return;
    }
    setBody("");
    setPage(0);
    load(0);
  };

  const react = async (entry: GbEntry, emoji: string) => {
    setErr("");
    const { data: out, error } = await supabaseBrowser().rpc(
      "hub_guestbook_react",
      { p_entry: entry.id, p_emoji: emoji },
    );
    if (error) {
      setErr(socialError(error, lang));
      return;
    }
    const reactions = (out as { reactions: GbReaction[] }).reactions;
    setData((d) =>
      d
        ? {
            ...d,
            entries: d.entries.map((e) =>
              e.id === entry.id ? { ...e, reactions } : e,
            ),
          }
        : d,
    );
  };

  const remove = async (entry: GbEntry) => {
    setErr("");
    const { error } = await supabaseBrowser().rpc("hub_guestbook_delete", {
      p_id: entry.id,
    });
    if (error) {
      setErr(socialError(error, lang));
      return;
    }
    load(page);
  };

  const goto = (pg: number) => {
    setPage(pg);
    load(pg);
  };

  return (
    <section>
      <h2>{s("guestbookHeading", lang)}</h2>

      {!loggedIn ? (
        <p style={{ margin: "0 0 12px" }}>
          <Link className="btn ghost" href="/login">
            {s("guestbookLoginCta", lang)}
          </Link>
        </p>
      ) : !isOwner ? (
        <div className="gb-composer">
          <textarea
            value={body}
            maxLength={500}
            rows={3}
            placeholder={s("guestbookPlaceholder", lang)}
            onChange={(e) => setBody(e.target.value)}
          />
          <div className="gb-composer-row">
            <span className="gb-count">{body.length}/500</span>
            <button
              type="button"
              className="btn"
              disabled={busy || body.trim().length === 0}
              onClick={post}
            >
              {s("guestbookPost", lang)}
            </button>
          </div>
        </div>
      ) : null}

      {err && (
        <p className="set-error" role="alert">
          {err}
        </p>
      )}

      {data.entries.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>{s("guestbookEmpty", lang)}</p>
      ) : (
        <div className="gb-list">
          {data.entries.map((e) => (
            <div key={e.id} className="gb-entry">
              <span className="avatar" aria-hidden>
                {e.author_avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.author_avatar} alt="" />
                ) : (
                  e.author_name.charAt(0).toUpperCase()
                )}
              </span>
              <div className="gb-main">
                <div className="gb-head">
                  {e.author_handle ? (
                    <Link href={`/u/${e.author_handle}`} className="nm">
                      {e.author_name}
                    </Link>
                  ) : (
                    <span className="nm">{e.author_name}</span>
                  )}
                  <span className="when">{timeAgo(e.created_at, lang)}</span>
                  {e.can_delete && (
                    <button
                      type="button"
                      className="gb-del"
                      title="Xóa"
                      onClick={() => remove(e)}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <p className="gb-body">{e.body}</p>
                <div className="gb-reactions">
                  {GUESTBOOK_EMOJIS.map((em) => {
                    const r = e.reactions.find((x) => x.emoji === em);
                    return (
                      <button
                        key={em}
                        type="button"
                        className={`gb-react${r?.mine ? " mine" : ""}`}
                        onClick={() => react(e, em)}
                      >
                        {em}
                        {r && r.count > 0 ? ` ${r.count}` : ""}
                      </button>
                    );
                  })}
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
            onClick={() => goto(page - 1)}
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
            onClick={() => goto(page + 1)}
          >
            →
          </button>
        </div>
      )}
    </section>
  );
}
