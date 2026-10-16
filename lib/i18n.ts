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
  login: { vi: "Đăng nhập", en: "Log in" },
  logout: { vi: "Đăng xuất", en: "Log out" },
  myProfile: { vi: "Hồ sơ của tôi", en: "My profile" },
  friendsHeading: { vi: "👥 Bạn bè đang chơi", en: "👥 Friends playing now" },
  friendsTeaser: {
    vi: "Đăng nhập để thấy bạn bè của bạn đang ở phòng nào — và vào chơi cùng họ ngay.",
    en: "Log in to see which rooms your friends are in — and jump in with them.",
  },
  friendsEmpty: {
    vi: "Bạn bè bạn đang theo dõi hiện không ở phòng nào. Khi họ mở phòng hoặc vào phòng, họ sẽ hiện ở đây.",
    en: "Nobody you follow is in a room right now. When they open or join a room, they'll show up here.",
  },
  activityHeading: { vi: "📡 Hoạt động mới", en: "📡 Latest activity" },
  loginTitle: { vi: "Đăng nhập SynerWorlds", en: "Log in to SynerWorlds" },
  loginSub: {
    vi: "Dùng chung tài khoản với các game — một tài khoản, mọi bàn cờ.",
    en: "Same account as the games — one account, every board.",
  },
  email: { vi: "Email", en: "Email" },
  password: { vi: "Mật khẩu", en: "Password" },
  signInBtn: { vi: "Đăng nhập", en: "Log in" },
  signUpBtn: { vi: "Đăng ký tài khoản mới", en: "Create account" },
  haveAccount: { vi: "Đã có tài khoản? Đăng nhập", en: "Have an account? Log in" },
  noAccount: { vi: "Chưa có tài khoản? Đăng ký", en: "New here? Sign up" },
  googleBtn: { vi: "Tiếp tục với Google", en: "Continue with Google" },
  facebookBtn: { vi: "Tiếp tục với Facebook", en: "Continue with Facebook" },
  orDivider: { vi: "hoặc", en: "or" },
  checkEmail: {
    vi: "Đã gửi email xác nhận — hãy kiểm tra hộp thư để kích hoạt tài khoản, rồi quay lại đăng nhập.",
    en: "Confirmation email sent — check your inbox to activate your account, then come back and log in.",
  },
  loginError: { vi: "Đăng nhập thất bại", en: "Login failed" },
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

/** Relative time: "5 phút trước" / "5m ago". */
export function timeAgo(iso: string, lang: Lang): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const sec = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (sec < 60) return lang === "vi" ? "vừa xong" : "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return lang === "vi" ? `${min} phút trước` : `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return lang === "vi" ? `${hr} giờ trước` : `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return lang === "vi" ? `${day} ngày trước` : `${day}d ago`;
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
