"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";

interface Me {
  handle: string | null;
  name: string;
  avatar: string | null;
}

export default function AuthBar() {
  const [me, setMe] = useState<Me | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    let cancelled = false;

    const load = async () => {
      const {
        data: { session },
      } = await sb.auth.getSession();
      if (cancelled) return;
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
    load();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(() => load());
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
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
    <span className="auth-bar">
      {me.handle ? (
        <Link href={`/u/${me.handle}`} className="auth-me" title="Hồ sơ của tôi">
          <span className="avatar sm" aria-hidden>
            {me.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatar} alt="" />
            ) : (
              me.name.charAt(0).toUpperCase()
            )}
          </span>
          <span className="auth-name">{me.name}</span>
        </Link>
      ) : (
        <span className="auth-name">{me.name}</span>
      )}
      <button type="button" className="auth-logout" onClick={logout}>
        Đăng xuất
      </button>
    </span>
  );
}
