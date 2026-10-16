export type Lang = "vi" | "en";

export function parseLang(v: string | undefined | null): Lang {
  return v === "en" ? "en" : "vi";
}

const STRINGS = {
  tagline: {
    vi: "Cổng chung của các trò chơi trí tuệ SynerWork — hồ sơ kỳ thủ xuyên mọi game.",
    en: "The SynerWork strategy-games portal — one player profile across every game.",
  },
  gamesHeading: { vi: "🎮 Các trò chơi", en: "🎮 The games" },
  players: { vi: "người chơi", en: "players" },
  playNow: { vi: "Chơi ngay ▸", en: "Play now ▸" },
  tryNow: { vi: "Thử ngay ▸", en: "Try it ▸" },
  topHeading: { vi: "🏆 Cao thủ đa game", en: "🏆 Top all-round players" },
  searchPlaceholder: {
    vi: "Tìm kỳ thủ theo tên hoặc @handle…",
    en: "Find a player by name or @handle…",
  },
  searchBtn: { vi: "Tìm", en: "Search" },
  searchResults: { vi: "Kết quả tìm kiếm", en: "Search results" },
  noResults: { vi: "Không tìm thấy kỳ thủ nào.", en: "No players found." },
  gamesPlayedOf: { vi: "game đã chơi", en: "games played" },
  totalXp: { vi: "Tổng XP", en: "Total XP" },
  totalGames: { vi: "Tổng số ván", en: "Total games" },
  bestRating: { vi: "Rating cao nhất", en: "Best rating" },
  memberSince: { vi: "Thành viên từ", en: "Member since" },
  rank: { vi: "Hạng", en: "Rank" },
  ofPlayers: { vi: "người chơi", en: "players" },
  peak: { vi: "Đỉnh", en: "Peak" },
  level: { vi: "Cấp", en: "Lv" },
  record: { vi: "Thắng–Hòa–Thua", en: "W–D–L" },
  games: { vi: "ván", en: "games" },
  lastPlayed: { vi: "Chơi gần nhất", en: "Last played" },
  notPlayedYet: { vi: "Chưa chơi game này", en: "Hasn't played this game yet" },
  share: { vi: "🔗 Chia sẻ hồ sơ", en: "🔗 Share profile" },
  copied: { vi: "Đã sao chép link!", en: "Link copied!" },
  copyLink: { vi: "Sao chép link", en: "Copy link" },
  profileNotFound: {
    vi: "Không tìm thấy kỳ thủ này.",
    en: "This player could not be found.",
  },
  profilePrivate: {
    vi: "Hồ sơ này đang ở chế độ riêng tư.",
    en: "This profile is private.",
  },
  backHome: { vi: "← Về trang chủ SynerWorlds", en: "← Back to SynerWorlds home" },
  dataPending: {
    vi: "Dữ liệu đang được cập nhật — vui lòng quay lại sau ít phút.",
    en: "Data is being updated — please check back in a few minutes.",
  },
  viewProfile: { vi: "Xem hồ sơ ▸", en: "View profile ▸" },
  profileOf: { vi: "Hồ sơ kỳ thủ", en: "Player profile" },
  roomsHeading: { vi: "🔴 Phòng chơi đang mở", en: "🔴 Open game rooms" },
  roomsAll: { vi: "Xem tất cả phòng ▸", en: "See all rooms ▸" },
  roomsPageTitle: { vi: "Phòng chơi công khai", en: "Public game rooms" },
  roomsPageSub: {
    vi: "Mọi phòng chơi công khai đang mở ở tất cả các game — bấm vào là vào thẳng phòng.",
    en: "Every public room currently open across all games — tap to jump straight in.",
  },
  inMatch: { vi: "⚔️ Đang đấu", en: "⚔️ Match in progress" },
  waitingRoom: { vi: "🟢 Đang chờ", en: "🟢 Waiting" },
  enterRoom: { vi: "Vào phòng ▸", en: "Enter room ▸" },
  roomsEmpty: {
    vi: "Hiện chưa có phòng công khai nào đang mở. Hãy mở một game và tạo phòng mới nhé!",
    en: "No public rooms are open right now. Open a game and create one!",
  },
  allGames: { vi: "Tất cả game", en: "All games" },
  roomCode: { vi: "Mã phòng", en: "Room code" },
} as const;

export type StringKey = keyof typeof STRINGS;

export function s(key: StringKey, lang: Lang): string {
  return STRINGS[key][lang];
}

// Family rating bands (same titles as the games' leaderboards).
const BANDS: { min: number; vi: string; en: string }[] = [
  { min: 1800, vi: "Đại Kiện Tướng", en: "Grandmaster" },
  { min: 1500, vi: "Kiện Tướng", en: "Master" },
  { min: 1200, vi: "Cao Cấp", en: "Advanced" },
  { min: 900, vi: "Trung Cấp", en: "Intermediate" },
  { min: 600, vi: "Sơ Cấp", en: "Beginner" },
  { min: 0, vi: "Tân Thủ", en: "Novice" },
];

export function ratingTitle(rating: number, lang: Lang): string {
  const band = BANDS.find((b) => rating >= b.min) ?? BANDS[BANDS.length - 1];
  return lang === "vi" ? band.vi : band.en;
}

export function fmtDate(iso: string | null | undefined, lang: Lang): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(lang === "vi" ? "vi-VN" : "en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
