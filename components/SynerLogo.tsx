/** SynerWorlds mark — a hub of worlds.
 *
 *  The central disc keeps the SynerWork red/blue split (right half red,
 *  left half blue), orbited by two solid "worlds" riding a bold ring.
 *  Hand-drawn vector, chunky geometry only — no thin details, no text —
 *  so it stays legible at favicon size (32×32).
 *
 *  Brand colors: --red #cf3a30, --blue #2569b8, ink #1d2733.
 */
export default function SynerLogo({
  size = 36,
  title = "SynerWorlds",
}: {
  size?: number;
  title?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      role="img"
      aria-label={title}
      style={{ flex: "none", display: "block" }}
    >
      {/* orbit ring */}
      <circle
        cx="32"
        cy="32"
        r="27"
        fill="none"
        stroke="#1d2733"
        strokeWidth="4"
      />
      {/* worlds on the orbit — red top-right, blue bottom-left */}
      <circle cx="51.1" cy="12.9" r="6.5" fill="#cf3a30" />
      <circle cx="12.9" cy="51.1" r="6.5" fill="#2569b8" />
      {/* hub: red/blue split disc */}
      <path d="M32 16a16 16 0 0 1 0 32z" fill="#cf3a30" />
      <path d="M32 16a16 16 0 0 0 0 32z" fill="#2569b8" />
    </svg>
  );
}
