import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Contact form endpoint — emails the site owner WITHOUT ever exposing
 * the owner's address on a page (anti-scraping requirement).
 *
 * LOGIN REQUIRED (anti-bot): the request must carry the sender's
 * Supabase access token; the account is verified server-side and the
 * reply address is the account's VERIFIED email — nothing about the
 * sender's identity is taken on trust from the request body.
 *
 * Env (server-only, set on the Vercel project):
 *   RESEND_API_KEY   — sending key (Resend)
 *   CONTACT_TO_EMAIL — recipient inbox
 * If either is missing the route answers 503 so the form shows a clear
 * "not configured yet" error instead of silently dropping messages.
 *
 * Extra spam defenses: honeypot field (bots fill it → fake success,
 * no send), strict length caps, topic whitelist, per-account rate
 * limit.
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

function rateLimited(key: string): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  return false;
}

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function POST(req: Request) {
  // --- Auth gate: verified Supabase account required ---
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
  const { data: userData, error: userError } = await sb.auth.getUser(token);
  const user = userData?.user;
  if (userError || !user || !user.email) {
    return NextResponse.json({ error: "auth_required" }, { status: 401 });
  }

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
  const topic = clean(body.topic, 24);
  const message = clean(body.message, 4000);

  if (!name || !message || message.length < 10) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  if (!TOPICS.has(topic)) {
    return NextResponse.json({ error: "bad_topic" }, { status: 400 });
  }

  if (rateLimited(user.id)) {
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
      reply_to: user.email,
      subject: `[SynerWorlds] ${topic} — ${name}`,
      text: `Từ: ${name} <${user.email}>\nTài khoản: ${user.id}\nChủ đề: ${topic}\n\n${message}`,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("resend send failed", res.status, detail.slice(0, 500));
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
