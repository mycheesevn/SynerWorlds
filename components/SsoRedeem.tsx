"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

/**
 * Redeem a one-time ?sso= hand-off token minted by one of the family
 * games (full-mesh SSO): a player signed in on any game lands on the
 * hub already signed in. The token is stripped from the URL first so
 * it is never shared or re-used; failures surface as a visible banner
 * (never swallowed) — the player can still sign in manually.
 */
export default function SsoRedeem() {
  const [failed, setFailed] = useState(false);
  const [en, setEn] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("sso");
    if (!token) return;
    setEn(params.get("lang") === "en");
    params.delete("sso");
    const rest = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash,
    );
    (async () => {
      try {
        const { error } = await supabaseBrowser().auth.verifyOtp({
          token_hash: token,
          type: "magiclink",
        });
        if (error) setFailed(true);
      } catch {
        setFailed(true);
      }
    })();
  }, []);

  if (!failed) return null;
  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 18,
        transform: "translateX(-50%)",
        zIndex: 60,
        maxWidth: "min(92vw, 520px)",
        background: "#7c2d12",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: 10,
        fontSize: 14,
        boxShadow: "0 8px 24px rgba(0,0,0,.35)",
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      <span>
        {en
          ? "That sign-in link expired or was invalid — please sign in again."
          : "Liên kết đăng nhập đã hết hạn hoặc không hợp lệ — vui lòng đăng nhập lại."}
      </span>
      <button
        type="button"
        onClick={() => setFailed(false)}
        aria-label={en ? "Dismiss" : "Đóng"}
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          fontSize: 16,
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
}
