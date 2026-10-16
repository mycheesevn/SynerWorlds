import { ImageResponse } from "next/og";

/** Apple touch icon (180×180 PNG, generated — no binary in the repo).
 *  Same hub-of-worlds mark as components/SynerLogo.tsx, drawn with
 *  Satori-friendly divs on a white field; satellite colors are CROSSED
 *  against the hub half they sit beside (blue by red, red by blue).
 *  Geometry: the 64-grid mark scaled ×2.8125. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#ffffff",
          position: "relative",
          display: "flex",
        }}
      >
        {/* orbit ring */}
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 14,
            width: 152,
            height: 152,
            borderRadius: "50%",
            border: "11px solid #1d2733",
            display: "flex",
          }}
        />
        {/* hub: split disc (left blue, right red) */}
        <div
          style={{
            position: "absolute",
            left: 45,
            top: 45,
            width: 45,
            height: 90,
            borderRadius: "45px 0 0 45px",
            background: "#2569b8",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 90,
            top: 45,
            width: 45,
            height: 90,
            borderRadius: "0 45px 45px 0",
            background: "#cf3a30",
            display: "flex",
          }}
        />
        {/* worlds on the orbit — crossed colors */}
        <div
          style={{
            position: "absolute",
            left: 125,
            top: 18,
            width: 37,
            height: 37,
            borderRadius: "50%",
            background: "#2569b8",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 18,
            top: 125,
            width: 37,
            height: 37,
            borderRadius: "50%",
            background: "#cf3a30",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
