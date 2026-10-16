"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import HandoffLink from "@/components/HandoffLink";
import { s, type Lang } from "@/lib/i18n";

interface FriendRoom {
  friend_id: string;
  handle: string | null;
  display_name: string;
  avatar_url: string | null;
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  accent: string | null;
  room_code: string;
  room_name: string;
  has_active_match: boolean;
  join_url: string;
}

type State =
  | { phase: "loading" }
  | { phase: "anon" }
  | { phase: "ready"; friends: FriendRoom[] };

export default function FriendsPlaying({ lang }: { lang: Lang }) {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    const sb = supabaseBrowser();
    let cancelled = false;
    const load = async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (cancelled) return;
      if (!session) {
        setState({ phase: "anon" });
        return;
      }
      const { data, error } = await sb.rpc("hub_friends_playing");
      if (cancelled) return;
      if (error || !data) {
        setState({ phase: "ready", friends: [] });
        return;
      }
      const parsed = data as { authed: boolean; friends: FriendRoom[] };
      setState({ phase: "ready", friends: parsed.friends ?? [] });
    };
    load();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(() => load());
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (state.phase === "loading") return null;

  if (state.phase === "anon") {
    return (
      <section>
        <h2>{s("friendsHeading", lang)}</h2>
        <div className="notice" style={{ marginTop: 0, textAlign: "left" }}>
          <p style={{ margin: "0 0 12px" }}>{s("friendsTeaser", lang)}</p>
          <Link className="btn" href="/login">
            {s("login", lang)}
          </Link>
        </div>
      </section>
    );
  }

  const friends = state.friends;
  return (
    <section>
      <h2>{s("friendsHeading", lang)}</h2>
      {friends.length === 0 ? (
        <p style={{ color: "var(--muted)", margin: 0 }}>
          {s("friendsEmpty", lang)}
        </p>
      ) : (
        <div className="player-list">
          {friends.map((f) => (
            <div key={f.friend_id} className="friend-row">
              <span className="avatar" aria-hidden>
                {f.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.avatar_url} alt="" />
                ) : (
                  f.display_name.charAt(0).toUpperCase()
                )}
              </span>
              <span className="who">
                {f.handle ? (
                  <Link href={`/u/${f.handle}`} className="nm">
                    {f.display_name}
                  </Link>
                ) : (
                  <span className="nm">{f.display_name}</span>
                )}
                <br />
                <span className="hd">
                  {f.icon ?? "🎲"} {lang === "vi" ? f.name_vi : f.name_en} ·{" "}
                  {f.room_name} · {s("roomCode", lang)} <b>{f.room_code}</b>
                </span>
              </span>
              <span
                className={f.has_active_match ? "badge live" : "badge wait"}
              >
                {f.has_active_match
                  ? s("inMatch", lang)
                  : s("waitingRoom", lang)}
              </span>
              <HandoffLink
                className="btn"
                style={{ background: f.accent ?? undefined }}
                href={f.join_url}
                newTab
              >
                {s("enterRoom", lang)}
              </HandoffLink>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
