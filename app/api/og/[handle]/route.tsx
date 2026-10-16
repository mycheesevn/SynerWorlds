import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/data";

export const runtime = "edge";

// Satori rules honored here: every element with more than one child
// declares display:flex, and text is composed as single strings (no
// nested inline elements). No emoji/symbol glyphs — Satori's dynamic
// emoji font fails on chess glyphs (♞) and would break the render.

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ handle: string }> },
) {
  const { handle } = await params;
  const p = await getPublicProfile(decodeURIComponent(handle));

  const name =
    p && p.found ? (p.display_name ?? p.handle ?? handle) : "SynerWorlds";
  const hd = p && p.found ? `@${p.handle}` : "";
  const totals = p && p.found && !p.private ? p.totals : null;
  const played =
    p && p.found && !p.private
      ? (p.games ?? []).filter((g) => g.played)
      : [];
  const initial = (name || "?").charAt(0).toUpperCase();
  const totalsLine = totals
    ? `${totals.xp.toLocaleString()} XP   ·   ${totals.games_count} games   ·   ${totals.games_played.toLocaleString()} ván đấu${
        totals.best_rating
          ? `   ·   Rating cao nhất ${totals.best_rating.toLocaleString()}`
          : ""
      }`
    : "Một tài khoản — mọi bàn cờ · One account, every board";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #f3f6fa 0%, #dbe7f5 100%)",
          padding: "56px 64px",
          fontFamily: "sans-serif",
          color: "#1d2733",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%", display: "flex",
              overflow: "hidden", border: "3px solid #222",
            }}
          >
            <div style={{ flex: 1, background: "#cf3a30", display: "flex" }} />
            <div style={{ flex: 1, background: "#2569b8", display: "flex" }} />
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 800 }}>
            <span>Syner</span>
            <span style={{ color: "#2569b8" }}>Worlds</span>
          </div>
        </div>

        <div
          style={{
            display: "flex", alignItems: "center", gap: 28, marginTop: 54,
          }}
        >
          {p?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={p.avatar_url}
              width={128}
              height={128}
              style={{ borderRadius: "50%", objectFit: "cover" }}
              alt=""
            />
          ) : (
            <div
              style={{
                width: 128, height: 128, borderRadius: "50%",
                background: "#2569b8", color: "#fff", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 56, fontWeight: 800,
              }}
            >
              {initial}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 58, fontWeight: 800, lineHeight: 1.1 }}>
              {name}
            </div>
            <div style={{ display: "flex", fontSize: 28, color: "#61707f", marginTop: 6 }}>
              {hd}
            </div>
            <div style={{ display: "flex", fontSize: 28, marginTop: 14 }}>
              {totalsLine}
            </div>
          </div>
        </div>

        {played.length > 0 && (
          <div style={{ display: "flex", gap: 14, marginTop: 48, flexWrap: "wrap" }}>
            {played.slice(0, 4).map((g) => (
              <div
                key={g.slug}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: "#ffffff", borderRadius: 14, padding: "12px 20px",
                  border: "1px solid #dde4ec", fontSize: 26,
                  borderLeft: `6px solid ${g.accent ?? "#2569b8"}`,
                }}
              >
                <span style={{ fontWeight: 700 }}>{g.name_vi}</span>
                <span style={{ color: "#b8860b", fontWeight: 800 }}>
                  {g.rating?.toLocaleString()}
                </span>
                {g.rank ? (
                  <span style={{ color: "#61707f" }}>{`#${g.rank}`}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <div
          style={{
            marginTop: "auto", fontSize: 24, color: "#61707f",
            display: "flex",
          }}
        >
          Một tài khoản — mọi bàn cờ · One account, every board
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    },
  );
}
