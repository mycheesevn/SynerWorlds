"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { s } from "@/lib/i18n";

interface Me {
  handle: string | null;
  name: string;
  avatar: string | null;
}

export default function AuthBar() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const explicitSignOutRef = useRef(false);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  useEffect(() => {
    const sb = supabaseBrowser();
    let cancelled = false;

    // allowRetry: when an auth event arrives with no session, a failed
    // token refresh can race the stored session — re-check once after
    // 1200ms before demoting the user to signed-out.
    const load = async (allowRetry = false) => {
      let session = (await sb.auth.getSession()).data.session;
      if (cancelled) return;
      if (!session && allowRetry) {
        await sleep(1200);
        if (cancelled) return;
        session = (await sb.auth.getSession()).data.session;
        if (cancelled) return;
      }
      if (!session) {
        setMe(null);
        setReady(true);
        return;
      }
      const { data } = await sb
        .from("profiles")
        .select("handle, full_name, username, avatar_url")
        .eq("id", session.user.id)
        .single();
      if (cancelled) return;
      setMe({
        handle: data?.handle ?? null,
        name:
          data?.full_name ||
          data?.username ||
          session.user.email?.split("@")[0] ||
          "Player",
        avatar: data?.avatar_url ?? null,
      });
      setReady(true);
    };
    load(false);
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange((event, session) => {
      // A user-initiated sign-out clears immediately — no re-verify delay.
      if (explicitSignOutRef.current) {
        explicitSignOutRef.current = false;
        setMe(null);
        setReady(true);
        return;
      }
      if (session) load(false);
      else load(true);
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open ]);

  const logout = async () => {
    setOpen(false);
    explicitSignOutRef.current = true;
    await supabaseBrowser().auth.signOut();
    setMe(null);
  };

  if (!ready) return <span className="auth-bar" aria-hidden />;

  if (!me) {
    return (
      <span className="auth-bar">
        <Link className="btn auth-login" href="/login">
          Đăng nhập
        </Link>
      </span>
    );
  }

  return (
    <span className="auth-bar auth-menu-wrap" ref={wrapRef}>
      <button
        type="button"
        className="auth-me-btn"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="avatar sm" aria-hidden>
          {me.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatar} alt="" />
          ) : (
            me.name.charAt(0).toUpperCase()
          )}
        </span>
        <span className="auth-name">{me.name}</span>
        <span className="auth-caret" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <span className="auth-dropdown" role="menu">
          {me.handle && (
            <Link
              href={`/u/${me.handle}`}
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              🌐 {s("publicProfile", "vi")}
            </Link>
          )}
          <Link href="/settings" role="menuitem" onClick={() => setOpen(false)}>
            👤 {s("profileMenu", "vi")}
          </Link>
          <button type="button" role="menuitem" onClick={logout}>
            {s("logout", "vi")}
          </button>
        </span>
      )}
    </span>
  );
}
