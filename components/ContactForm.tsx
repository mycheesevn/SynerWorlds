"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

/**
 * Contact form — posts to /api/contact, which emails the site owner
 * server-side (the owner's address never appears on any page).
 * Every failure state renders a visible message; nothing is swallowed.
 */

const L = {
  name: { vi: "Tên của bạn", en: "Your name" },
  email: { vi: "Email của bạn", en: "Your email" },
  topic: { vi: "Chủ đề", en: "Topic" },
  message: { vi: "Nội dung", en: "Message" },
  send: { vi: "Gửi liên hệ", en: "Send message" },
  sending: { vi: "Đang gửi…", en: "Sending…" },
  sentTitle: { vi: "Đã gửi! 🎉", en: "Sent! 🎉" },
  sentBody: {
    vi: "Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi vào email của bạn trong thời gian sớm nhất.",
    en: "Thanks for reaching out. We'll reply to your email as soon as we can.",
  },
  sendAnother: { vi: "Gửi tin nhắn khác", en: "Send another message" },
  errMissing: {
    vi: "Vui lòng điền tên, email hợp lệ và nội dung (ít nhất 10 ký tự).",
    en: "Please fill in your name, a valid email, and a message (at least 10 characters).",
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

export default function ContactForm({ lang }: { lang: Lang }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      topic: String(fd.get("topic") ?? "general"),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""), // honeypot
    };
    if (
      !payload.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(payload.email.trim()) ||
      payload.message.trim().length < 10
    ) {
      setError(L.errMissing[lang]);
      return;
    }
    setError(null);
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setState("sent");
        form.reset();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(
        data.error === "rate_limited"
          ? L.errRate[lang]
          : data.error === "not_configured"
            ? L.errConfig[lang]
            : data.error === "missing_fields" || data.error === "bad_email"
              ? L.errMissing[lang]
              : L.errSend[lang],
      );
      setState("idle");
    } catch {
      setError(L.errSend[lang]);
      setState("idle");
    }
  }

  if (state === "sent") {
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
          onClick={() => setState("idle")}
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
      <label style={labelStyle} htmlFor="cf-name">
        {L.name[lang]}
      </label>
      <input id="cf-name" name="name" required maxLength={80} style={inputStyle} autoComplete="name" />

      <label style={labelStyle} htmlFor="cf-email">
        {L.email[lang]}
      </label>
      <input id="cf-email" name="email" type="email" required maxLength={120} style={inputStyle} autoComplete="email" />

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
      <textarea id="cf-message" name="message" required minLength={10} maxLength={4000} rows={6} style={{ ...inputStyle, resize: "vertical" }} />

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
        disabled={state === "sending"}
        style={{
          marginTop: 20,
          padding: "12px 26px",
          borderRadius: 10,
          border: "none",
          background: "var(--blue, #2569b8)",
          color: "#fff",
          fontSize: 16,
          fontWeight: 700,
          cursor: state === "sending" ? "wait" : "pointer",
          opacity: state === "sending" ? 0.7 : 1,
        }}
      >
        {state === "sending" ? L.sending[lang] : L.send[lang]}
      </button>
    </form>
  );
}
