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
  profileMenu: { vi: "Hồ sơ & Cài đặt", en: "Profile & Settings" },
  publicProfile: { vi: "Hồ sơ công khai", en: "Public profile" },
  settingsTitle: { vi: "👤 Hồ sơ", en: "👤 Profile" },
  changeAvatar: { vi: "Đổi ảnh đại diện", en: "Change avatar" },
  avatarError: {
    vi: "Không tải được ảnh. Vui lòng thử lại.",
    en: "Could not upload the image. Please try again.",
  },
  fullName: { vi: "Họ tên", en: "Full name" },
  birthDate: { vi: "Ngày sinh", en: "Date of birth" },
  city: { vi: "Thành phố", en: "City" },
  country: { vi: "Quốc gia", en: "Country" },
  usernameL: { vi: "Tên đăng nhập", en: "Username" },
  emailL: { vi: "Email", en: "Email" },
  saveBtn: { vi: "Lưu", en: "Save" },
  savedOk: { vi: "Đã lưu ✓", en: "Saved ✓" },
  saveError: {
    vi: "Lưu thất bại. Vui lòng thử lại.",
    en: "Could not save. Please try again.",
  },
  shareProfileBtn: { vi: "Chia sẻ hồ sơ", en: "Share profile" },
  downloadCard: { vi: "Tải thẻ chia sẻ", en: "Download share card" },
  linkCopied: { vi: "Đã sao chép liên kết ✓", en: "Link copied ✓" },
  referralTitle: { vi: "🎁 Giới thiệu bạn bè", en: "🎁 Invite friends" },
  referralText: {
    vi: "Chia sẻ mã giới thiệu của bạn — mã dùng chung cho mọi game trong hệ thống SynerWorlds.",
    en: "Share your referral code — it works across every SynerWorlds game.",
  },
  referralCode: { vi: "Mã giới thiệu", en: "Referral code" },
  copyBtn: { vi: "Sao chép", en: "Copy" },
  privacyTitle: { vi: "🔒 Quyền riêng tư", en: "🔒 Privacy" },
  handleTitle: { vi: "🔗 Handle công khai", en: "🔗 Public handle" },
  handleRules: {
    vi: "3–24 ký tự: chữ thường, số và dấu '-' giữa các từ (ví dụ: cao-thu-99).",
    en: "3–24 characters: lowercase letters, digits and '-' between words (e.g. cao-thu-99).",
  },
  handleChangeBtn: { vi: "Đổi handle", en: "Change handle" },
  handleNewLabel: { vi: "Handle mới", en: "New handle" },
  handleWarn: {
    vi: "Link hồ sơ cũ /u/{old} sẽ ngừng hoạt động ngay khi đổi. Bạn chỉ đổi lại được sau 30 ngày.",
    en: "Your old profile link /u/{old} stops working as soon as you change. You can change again only after 30 days.",
  },
  handleConfirmBtn: { vi: "Xác nhận đổi", en: "Confirm change" },
  handleCancelBtn: { vi: "Hủy", en: "Cancel" },
  handleChangedOk: { vi: "Đã đổi handle thành công!", en: "Handle changed!" },
  handleCooldownNote: {
    vi: "Bạn vừa đổi handle gần đây — lần đổi tiếp theo từ ngày",
    en: "You changed your handle recently — next change from",
  },
  handleErrInvalid: {
    vi: "Handle chưa hợp lệ — 3–24 ký tự, chỉ chữ thường, số và dấu '-' giữa các từ.",
    en: "Invalid handle — 3–24 characters, lowercase letters, digits and single '-' between words only.",
  },
  handleErrTaken: {
    vi: "Handle này đã có người dùng — hãy chọn handle khác.",
    en: "That handle is already taken — please pick another.",
  },
  handleErrReserved: {
    vi: "Handle này được dành riêng cho hệ thống — hãy chọn handle khác.",
    en: "That handle is reserved — please pick another.",
  },
  handleErrSoon: {
    vi: "Bạn đổi handle quá gần đây — hãy đợi đủ 30 ngày giữa hai lần đổi.",
    en: "You changed your handle too recently — please wait 30 days between changes.",
  },
  privacyPublic: { vi: "Hồ sơ công khai", en: "Public profile" },
  privacyText: {
    vi: "Khi bật, mọi người xem được thành tích của bạn tại trang hồ sơ và bạn xuất hiện trong tìm kiếm, bảng cao thủ và tin hoạt động. Khi tắt, trang hồ sơ chỉ hiện tên và ảnh đại diện.",
    en: "When on, anyone can see your stats on your profile page and you appear in search, top players and the activity feed. When off, your profile page shows only your name and avatar.",
  },
  passwordTitle: { vi: "🔑 Đổi mật khẩu", en: "🔑 Change password" },
  newPassword: { vi: "Mật khẩu mới", en: "New password" },
  confirmPassword: { vi: "Nhập lại mật khẩu mới", en: "Repeat new password" },
  changePwBtn: { vi: "Đổi mật khẩu", en: "Change password" },
  pwMismatch: {
    vi: "Mật khẩu nhập lại không khớp.",
    en: "The passwords do not match.",
  },
  pwTooShort: {
    vi: "Mật khẩu cần ít nhất 6 ký tự.",
    en: "Password must be at least 6 characters.",
  },
  pwChanged: { vi: "Đã đổi mật khẩu ✓", en: "Password changed ✓" },
  pwError: {
    vi: "Đổi mật khẩu thất bại. Vui lòng thử lại.",
    en: "Could not change the password. Please try again.",
  },
  challengeBtn: { vi: "⚔️ Thách đấu", en: "⚔️ Challenge" },
  challengePick: {
    vi: "Chọn game để thách đấu:",
    en: "Pick a game to challenge in:",
  },
  guestbookHeading: { vi: "📖 Sổ lưu bút", en: "📖 Guestbook" },
  guestbookEmpty: {
    vi: "Chưa có lời nhắn nào. Hãy là người đầu tiên!",
    en: "No messages yet. Be the first!",
  },
  guestbookPlaceholder: {
    vi: "Để lại lời nhắn…",
    en: "Leave a message…",
  },
  guestbookPost: { vi: "Gửi", en: "Post" },
  guestbookLoginCta: {
    vi: "Đăng nhập để viết lưu bút",
    en: "Log in to write in the guestbook",
  },
  needPlayError: {
    vi: "Bạn cần chơi ít nhất 1 ván (ở bất kỳ game nào) trước khi dùng tính năng này.",
    en: "You need to play at least one game (any game) before using this.",
  },
  slowDownError: {
    vi: "Bạn gửi hơi nhanh — chờ một chút rồi thử lại.",
    en: "You are posting too fast — wait a moment and try again.",
  },
  lfgHeading: { vi: "🎯 Tìm đối thủ", en: "🎯 Find an opponent" },
  lfgSub: {
    vi: "Đăng tin tìm đối thủ — người khác thấy tin, bấm Thách đấu là vào game gửi lời thách đấu cho bạn ngay.",
    en: "Post that you are looking for a match — others tap Challenge to send you one in the game right away.",
  },
  lfgPlaceholder: {
    vi: "Ví dụ: Tìm đối thủ Cờ Gánh tối nay, rating ~1200",
    en: "E.g. Looking for a Co Ganh match tonight, rating ~1200",
  },
  lfgGameLabel: { vi: "Game", en: "Game" },
  lfgHoursLabel: { vi: "Hiện trong", en: "Show for" },
  lfgPostBtn: { vi: "Đăng tin", en: "Post" },
  lfgEmpty: {
    vi: "Chưa có tin tìm đối thủ nào. Đăng tin đầu tiên nhé!",
    en: "No one is looking right now. Post the first one!",
  },
  lfgAllGames: { vi: "Tất cả game", en: "All games" },
  lfgClose: { vi: "Đóng tin", en: "Close post" },
  lfgCapError: {
    vi: "Bạn đang có 2 tin còn hiệu lực — đóng bớt một tin trước khi đăng tiếp.",
    en: "You already have 2 active posts — close one before posting again.",
  },
  lfgLoginCta: {
    vi: "Đăng nhập để đăng tin tìm đối thủ",
    en: "Log in to post",
  },
  lfgLatestHeading: { vi: "🎯 Đang tìm đối thủ", en: "🎯 Looking for a match" },
  lfgViewBoard: { vi: "Xem bảng tìm đối thủ", en: "Open the board" },
  settingsLoginPrompt: {
    vi: "Bạn cần đăng nhập để xem và chỉnh sửa hồ sơ.",
    en: "You need to log in to view and edit your profile.",
  },
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
