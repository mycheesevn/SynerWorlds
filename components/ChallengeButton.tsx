"use client";

import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { s, type Lang } from "@/lib/i18n";
import HandoffLink from "@/components/HandoffLink";

export interface ChallengeGame {
  slug: string;
  name_vi: string;
  name_en: string;
  icon: string | null;
  accent: string | null;
  site_url: string;
  played: boolean;
  rating: number | null;
}

export default function ChallengeButton({
  handle,
  games,
  lang,
}: {
  handle: string;
  games: ChallengeGame[];
  lang: Lang;
}) {
  const [myHandle, setMyHandle] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    (async () => {
      const sb = supabaseBrowser();
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (session) {
        const { data } = await sb
          .from("profiles")
          .select("handle")
          .eq("id", session.user.id)
          .single();
        setMyHandle(data?.handle ?? null);
      }
      setChecked(true);
    })();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open ]);

  // Never offer a challenge to yourself.
  if (checked && myHandle === handle) return null;

  const sorted = [...games].sort(
    (a, b) => Number(b.played) - Number(a.played),
  );

  return (
    <span className="challenge-wrap" ref={wrapRef}>
      <button
        type="button"
        className="btn challenge-btn"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {s("challengeBtn", lang)}
      </button>
      {open && (
        <span className="challenge-picker" role="menu">
          <span className="cp-title">{s("challengePick", lang)}</span>
          {sorted.map((g) => (
            <HandoffLink
              key={g.slug}
              href={`${g.site_url}/?challenge=${encodeURIComponent(handle)}`}
              role="menuitem"
            >
              <span aria-hidden>{g.icon ?? "🎲"}</span>{" "}
              {lang === "vi" ? g.name_vi : g.name_en}
              {g.played && g.rating ? (
                <span className="cp-rating">⭐ {g.rating.toLocaleString()}</span>
              ) : null}
            </HandoffLink>
          ))}
        </span>
      )}
    </span>
  );
}
