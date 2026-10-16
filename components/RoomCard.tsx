import type { HubRoom } from "@/lib/data";
import { s, type Lang } from "@/lib/i18n";

export default function RoomCard({
  room,
  lang,
}: {
  room: HubRoom;
  lang: Lang;
}) {
  const gameName = lang === "vi" ? room.name_vi : room.name_en;
  return (
    <div
      className="room-card"
      style={{ borderTopColor: room.accent ?? undefined }}
    >
      <div className="rc-game">
        <span className="rc-icon">{room.icon ?? "🎲"}</span>
        <span className="rc-gname">{gameName}</span>
        <span className="spacer" />
        <span className={room.has_active_match ? "badge live" : "badge wait"}>
          {room.has_active_match ? s("inMatch", lang) : s("waitingRoom", lang)}
        </span>
      </div>
      <div className="rc-name">{room.name}</div>
      <div className="rc-meta">
        <span className="code-chip">
          {s("roomCode", lang)}: <b>{room.code}</b>
        </span>
        <span>
          👥 {room.member_count}/{room.max_players}
        </span>
      </div>
      <a
        className="btn"
        style={{ background: room.accent ?? undefined }}
        href={room.join_url}
        target="_blank"
        rel="noreferrer"
      >
        {s("enterRoom", lang)}
      </a>
    </div>
  );
}
