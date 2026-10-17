import { NextResponse } from "next/server";

/**
 * Contact form endpoint — emails the site owner WITHOUT ever exposing
 * the owner's address on a page (anti-scraping requirement).
 *
 * Env (server-only, set on the Vercel project):
 *   RESEND_API_KEY   — sending key (Resend)
 *   CONTACT_TO_EMAIL — recipient inbox
 * If either is missing the route answers 503 so the form shows a clear
 * "not configured yet" error instead of silently dropping messages.
 *
 * Spam defenses: honeypot field (bots fill it → fake success, no send),
 * strict length caps, topic whitelist, best-effort per-IP rate limit.
 */

const TOPICS = new Set([
  "general",
  "bug",
  "account",
  "data-deletion",
  "other",
]);

const hits = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return true;
  }
  list.push(now);
  hits.set(ip, list);
  return false;
}

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Honeypot: a field humans never see. Filled ⇒ bot ⇒ pretend success.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(body.name, 80);
  const email = clean(body.email, 120);
  const topic = clean(body.topic, 24);
  const message = clean(body.message, 4000);

  if (!name || !message || message.length < 10) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "bad_email" }, { status: 400 });
  }
  if (!TOPICS.has(topic)) {
    return NextResponse.json({ error: "bad_topic" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "SynerWorlds <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `[SynerWorlds] ${topic} — ${name}`,
      text: `Từ: ${name} <${email}>\nChủ đề: ${topic}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
