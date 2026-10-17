"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { Lang } from "@/lib/i18n";

/**
 * Contact form — LOGIN REQUIRED (anti-bot): only verified account
 * holders can send; the API route re-checks the access token
 * server-side and uses the account's verified email as reply-to.
 * Posts to /api/contact, which emails the site owner server-side
 * (the owner's address never appears on any page).
 * Every failure state renders a visible message; nothing is swallowed.
 */

const L = {
  name: { vi: "Tên của bạn", en: "Your name" },
  topic: { vi: "Chủ đề", en: "Topic" },
  message: { vi: "Nội dung", en: "Message" },
  replyTo: {
    vi: "Phản hồi sẽ được gửi tới email tài khoản của bạn:",
    en: "Replies will go to your account email:",
  },
  send: { vi: "Gửi liên hệ", en: "Send message" },
  sending: { vi: "Đang gửi…", en: "Sending…" },
  sentTitle: { vi: "Đã gửi! 🎉", en: "Sent! 🎉" },
  sentBody: {
    vi: "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi vào email tài khoản của bạn trong thời gian sớm nhất.",
    en: "Thanks for reaching out. We'll reply to your account email as soon as we can.",
  },
  sendAnother: { vi: "Gửi tin nhắn khác", en: "Send another message" },
  gateTitle: {
    vi: "Bạn cần đăng nhập để gửi liên hệ 🔐",
    en: "Please sign in to send a message 🔐",
  },
  gateBody: {
    vi: "Để chống thư rác và tin nhắn tự động, biểu mẫu liên hệ chỉ dành cho người chơi đã đăng nhập. Đăng nhập xong bạn quay lại trang này là gửi được ngay — tài khoản SynerWorlds dùng chung cho mọi game.",
    en: "To stop spam and automated messages, the contact form is only available to signed-in players. Sign in, come back to this page, and you can send right away — your SynerWorlds account works across every game.",
  },
  gateBtn: { vi: "Đăng nhập", en: "Sign in" },
  checking: { vi: "Đang kiểm tra đăng nhập…", en: "Checking your sign-in…" },
  errMissing: {
    vi: "Vui lòng điền tên và nội dung (ít nhất 10 ký tự).",
    en: "Please fill in your name and a message (at least 10 characters).",
  },
  errAuth: {
    vi: "Phiên đăng nhập đã hết hạn — vui lòng đăng nhập lại rồi gửi tiếp.",
    en: "Your session has expired — please sign in again and resend.",
  },
  errRate: {
    vi: "Bạn đã gửi quá nhiều tin nhắn trong thời gian ngắn — vui lòng thử lại sau.",
    en: "You've sent too many messages in a short time — please try again later.",
  },
  errConfig: {
    vi: "Biểu mẫu chưa được cấu hình xong ở phía máy chủ — vui lòng quay lại sau ít hôm.",
    en: "The form isn't fully configured on the server yet — please check back in a few days.",
  },
  errSend: {
    vi: "Gửi không thành công do lỗi hệ thống — vui lòng thử lại.",
    en: "Sending failed due to a system error — please try again.",
  },
  topics: {
    vi: [
      ["general", "Góp ý chung"],
      ["bug", "Báo lỗi"],
      ["account", "Vấn đề tài khoản"],
      ["data-deletion", "Yêu cầu xóa dữ liệu"],
      ["other", "Khác"],
    ],
    en: [
      ["general", "General feedback"],
      ["bug", "Report a bug"],
      ["account", "Account problem"],
      ["data-deletion", "Data deletion request"],
      ["other", "Other"],
    ],
  } as Record<Lang, [string, string][]>,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--border, #d4d9e0)",
  fontSize: 15,
  background: "var(--card, #fff)",
  color: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  margin: "16px 0 6px",
  fontSize: 14,
};

type Phase = "checking" | "gate" | "ready" | "sent";

export default function ContactForm({ lang }: { lang: Lang }) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [accountEmail, setAccountEmail] = useState("");
  const [defaultName, setDefaultName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = supabaseBrowser();
      const { data } = await sb.auth.getSession();
      if (!alive) return;
      const user = data.session?.user;
      if (!user) {
        setPhase("gate");
        return;
      }
      setAccountEmail(user.email ?? "");
      const meta = (user.user_metadata ?? {}) as { full_name?: string };
      setDefaultName(meta.full_name ?? "");
      setPhase("ready");
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      topic: String(fd.get("topic") ?? "general"),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""), // honeypot
    };
    if (!payload.name.trim() || payload.message.trim().length < 10) {
      setError(L.errMissing[lang]);
      return;
    }
    const sb = supabaseBrowser();
    const { data } = await sb.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError(L.errAuth[lang]);
      setPhase("gate");
      return;
    }
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setPhase("sent");
        form.reset();
        setSending(false);
        return;
      }
      const d = (await res.json().catch(() => ({}))) as { error?: string };
      if (d.error === "auth_required") {
        setError(L.errAuth[lang]);
        setPhase("gate");
      } else {
        setError(
          d.error === "rate_limited"
            ? L.errRate[lang]
            : d.error === "not_configured"
              ? L.errConfig[lang]
              : d.error === "missing_fields" || d.error === "bad_topic"
                ? L.errMissing[lang]
                : L.errSend[lang],
        );
      }
      setSending(false);
    } catch {
      setError(L.errSend[lang]);
      setSending(false);
    }
  }

  if (phase === "checking") {
    return <p style={{ color: "var(--muted)" }}>{L.checking[lang]}</p>;
  }

  if (phase === "gate") {
    return (
      <div
        style={{
          border: "1px solid var(--border, #d4d9e0)",
          borderRadius: 12,
          padding: "22px 20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 19, fontWeight: 700, margin: "0 0 8px" }}>
          {L.gateTitle[lang]}
        </p>
        <p style={{ color: "var(--muted)", margin: "0 0 18px", lineHeight: 1.6 }}>
          {L.gateBody[lang]}
        </p>
        {error ? (
          <p role="alert" style={{ color: "#8f1d16", margin: "0 0 14px" }}>
            ⚠️ {error}
          </p>
        ) : null}
        <Link
          href="/login"
          style={{
            display: "inline-block",
            padding: "12px 26px",
            borderRadius: 10,
            background: "var(--blue, #2569b8)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          {L.gateBtn[lang]}
        </Link>
      </div>
    );
  }

  if (phase === "sent") {
    return (
      <div
        style={{
          border: "1px solid var(--border, #d4d9e0)",
          borderRadius: 12,
          padding: "22px 20px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>
          {L.sentTitle[lang]}
        </p>
        <p style={{ color: "var(--muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
          {L.sentBody[lang]}
        </p>
        <button
          type="button"
          onClick={() => setPhase("ready")}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            border: "1px solid var(--border, #d4d9e0)",
            background: "transparent",
            color: "inherit",
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          {L.sendAnother[lang]}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <p style={{ color: "var(--muted)", margin: "4px 0 0", lineHeight: 1.6 }}>
        {L.replyTo[lang]} <strong style={{ color: "inherit" }}>{accountEmail}</strong>
      </p>

      <label style={labelStyle} htmlFor="cf-name">
        {L.name[lang]}
      </label>
      <input
        id="cf-name"
        name="name"
        required
        maxLength={80}
        style={inputStyle}
        autoComplete="name"
        defaultValue={defaultName}
      />

      <label style={labelStyle} htmlFor="cf-topic">
        {L.topic[lang]}
      </label>
      <select id="cf-topic" name="topic" style={inputStyle} defaultValue="general">
        {L.topics[lang].map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <label style={labelStyle} htmlFor="cf-message">
        {L.message[lang]}
      </label>
      <textarea
        id="cf-message"
        name="message"
        required
        minLength={10}
        maxLength={4000}
        rows={6}
        style={{ ...inputStyle, resize: "vertical" }}
      />

      {/* honeypot — invisible to humans, filled by bots */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} aria-hidden="true">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {error ? (
        <p
          role="alert"
          style={{
            margin: "16px 0 0",
            padding: "10px 12px",
            borderRadius: 8,
            background: "#fdeceb",
            color: "#8f1d16",
            lineHeight: 1.5,
          }}
        >
          ⚠️ {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={sending}
        style={{
          marginTop: 20,
          padding: "12px 26px",
          borderRadius: 10,
          border: "none",
          background: "var(--blue, #2569b8)",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          cursor: sending ? "wait" : "pointer",
          opacity: sending ? 0.7 : 1,
        }}
      >
        {sending ? L.sending[lang] : L.send[lang]}
      </button>
    </form>
  );
}
