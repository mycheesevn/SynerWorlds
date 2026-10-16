import { ImageResponse } from "next/og";
import { getPublicProfile } from "@/lib/data";

export const runtime = "edge";

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
            <div style={{ flex: 1, background: "#cf3a30" }} />
            <div style={{ flex: 1, background: "#2569b8" }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>
            Syner<span style={{ color: "#2569b8" }}>Worlds</span>
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
              {(name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.1 }}>
              {name}
            </div>
            <div style={{ fontSize: 28, color: "#61707f", marginTop: 6 }}>
              {hd}
            </div>
            {totals && (
              <div style={{ fontSize: 28, marginTop: 14, display: "flex", gap: 24 }}>
                <span>
                  <b>{totals.xp.toLocaleString()}</b> XP
                </span>
                <span>
                  <b>{totals.games_count}</b> games
                </span>
                {totals.best_rating ? (
                  <span>
                    ⭐ <b>{totals.best_rating.toLocaleString()}</b>
                  </span>
                ) : null}
              </div>
            )}
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
                }}
              >
                <span>{g.icon ?? "🎲"}</span>
                <span style={{ fontWeight: 700 }}>{g.name_vi}</span>
                <span style={{ color: "#b8860b", fontWeight: 800 }}>
                  {g.rating?.toLocaleString()}
                </span>
                {g.rank ? <span style={{ color: "#61707f" }}>#{g.rank}</span> : null}
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
    { width: 1200, height: 630 },
  );
}
