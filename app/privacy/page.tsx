import type { Metadata } from "next";
import Link from "next/link";
import { parseLang, type Lang } from "@/lib/i18n";

/**
 * Privacy Policy — required by Meta before the Facebook app can go Live
 * (Privacy Policy URL + Data Deletion Instructions URL → #data-deletion).
 * Self-contained bilingual content; language follows the hub's ?lang=
 * convention (default vi). Applies to the hub + all SynerWork games,
 * which share one account system.
 */

const UPDATED = { vi: "17 tháng 10, 2026", en: "October 17, 2026" };
const CONTACT_EMAIL = "kennybvn@gmail.com";

type Section = {
  id?: string;
  h: Record<Lang, string>;
  body: Record<Lang, string[]>;
  list?: Record<Lang, string[]>;
};

const TITLE: Record<Lang, string> = {
  vi: "Chính sách bảo mật",
  en: "Privacy Policy",
};

const INTRO: Record<Lang, string> = {
  vi: "SynerWorlds là cổng game trí tuệ miễn phí trên nền web của SynerWork Inc. — gồm trang hub này và các trò chơi Cờ Tướng, Cờ Vua, Cờ Chiếu Tướng, Cờ Gánh, Cờ Nhào, Ô Ăn Quan, Cờ Cá Ngựa, Sudoku, Cross Words và Word Search. Tất cả dùng chung một hệ thống tài khoản. Chính sách này giải thích chúng tôi thu thập dữ liệu gì, dùng vào việc gì, và quyền của bạn với dữ liệu đó.",
  en: "SynerWorlds is the free, web-based strategy-games portal of SynerWork Inc. — this hub plus the games Xiangqi, Chess, Vietnamese General Check, Co Ganh, Co Nhao, O An Quan, Ca Ngua, Sudoku, Cross Words and Word Search. All of them share one account system. This policy explains what data we collect, what we use it for, and your rights over it.",
};

const SECTIONS: Section[] = [
  {
    h: { vi: "1. Dữ liệu chúng tôi thu thập", en: "1. Data we collect" },
    body: {
      vi: [],
      en: [],
    },
    list: {
      vi: [
        "Tài khoản: địa chỉ email. Nếu bạn đăng nhập bằng Google hoặc Facebook, chúng tôi nhận tên và ảnh đại diện mà nhà cung cấp đó chia sẻ.",
        "Hồ sơ bạn tự cung cấp: tên hiển thị, ngày sinh, thành phố, quốc gia, ảnh đại diện (trừ tên hiển thị, tất cả đều không bắt buộc).",
        "Dữ liệu chơi game: ván đã chơi và kết quả, XP, rating, cấp độ, câu đố, phòng chơi bạn tham gia, bạn bè/lượt theo dõi, lời thách đấu, lời nhắn lưu bút, bài đăng tìm đối thủ, bình luận và biểu cảm.",
        "Thông báo đẩy: nếu bạn bật thông báo, trình duyệt cấp cho chúng tôi một địa chỉ đăng ký push để gửi thông báo (ví dụ khi có người thách đấu bạn).",
        "Kỹ thuật: nhật ký máy chủ tiêu chuẩn, và các tùy chọn (ngôn ngữ, hiển thị) lưu trong local storage của trình duyệt bạn.",
      ],
      en: [
        "Account: your email address. If you sign in with Google or Facebook, we receive the name and profile picture that provider shares.",
        "Profile you provide: display name, date of birth, city, country, avatar photo (everything except the display name is optional).",
        "Gameplay data: games played and their results, XP, ratings, levels, puzzles, rooms you join, friends/follows, challenges, guestbook messages, looking-for-opponent posts, comments and reactions.",
        "Push notifications: if you enable them, your browser gives us a push subscription endpoint so we can notify you (for example when someone challenges you).",
        "Technical: standard server logs, and preferences (language, display options) stored in your browser's local storage.",
      ],
    },
  },
  {
    h: { vi: "2. Chúng tôi dùng dữ liệu để làm gì", en: "2. How we use it" },
    body: {
      vi: [
        "Dữ liệu chỉ dùng để vận hành trò chơi: lưu kết quả và tiến trình của bạn, tính XP và rating, hiển thị bảng xếp hạng và hồ sơ công khai, kết nối bạn bè và phòng chơi, gửi thông báo bạn đã đồng ý nhận, và bảo vệ tài khoản khỏi lạm dụng.",
        "Chúng tôi KHÔNG bán dữ liệu cá nhân, không chạy quảng cáo của bên thứ ba, và các trò chơi hoàn toàn không có yếu tố cờ bạc hay nạp tiền ăn tiền.",
      ],
      en: [
        "Data is used only to run the games: saving your results and progress, computing XP and ratings, showing leaderboards and public profiles, connecting friends and game rooms, sending notifications you opted into, and protecting accounts from abuse.",
        "We do NOT sell personal data, we run no third-party advertising, and the games involve no gambling or real-money play of any kind.",
      ],
    },
  },
  {
    h: { vi: "3. Thông tin công khai", en: "3. Public information" },
    body: {
      vi: [
        "Hồ sơ kỳ thủ (tên handle, tên hiển thị, ảnh đại diện, thống kê và rating các game) mặc định ở chế độ công khai để người chơi tìm và thách đấu lẫn nhau. Bạn có thể chuyển hồ sơ sang riêng tư bất cứ lúc nào trong mục Cài đặt. Nội dung bạn tự đăng (lưu bút, bài tìm đối thủ, bình luận trong phòng) là công khai với người xem trang đó.",
      ],
      en: [
        "Player profiles (handle, display name, avatar, per-game statistics and ratings) are public by default so players can find and challenge each other. You can switch your profile to private at any time in Settings. Content you post yourself (guestbook entries, looking-for-opponent posts, room comments) is visible to viewers of that page.",
      ],
    },
  },
  {
    h: { vi: "4. Ai xử lý dữ liệu cùng chúng tôi", en: "4. Who processes data with us" },
    body: {
      vi: [
        "Dữ liệu được lưu trữ và xử lý bởi Supabase (cơ sở dữ liệu và hệ thống đăng nhập) và các trang web được vận hành trên Vercel. Khi bạn đăng nhập bằng Google hoặc Facebook, nhà cung cấp đó xác thực bạn theo chính sách riêng của họ. Một số trang game dùng Google Analytics để đếm lượt truy cập tổng hợp. Ngoài các bên trên, chúng tôi không chia sẻ dữ liệu cá nhân cho bất kỳ ai, trừ khi pháp luật yêu cầu.",
      ],
      en: [
        "Data is stored and processed by Supabase (database and sign-in system) and the websites are hosted on Vercel. When you sign in with Google or Facebook, that provider authenticates you under its own policy. Some game sites use Google Analytics for aggregate visit counts. Beyond the above, we do not share personal data with anyone, except where required by law.",
      ],
    },
  },
  {
    h: { vi: "5. Cookie và lưu trữ trên trình duyệt", en: "5. Cookies and browser storage" },
    body: {
      vi: [
        "Phiên đăng nhập và các tùy chọn hiển thị/ngôn ngữ được giữ trong local storage của trình duyệt trên chính thiết bị của bạn. Chúng tôi không dùng cookie quảng cáo hay cookie theo dõi của bên thứ ba. Đăng xuất sẽ xóa phiên đăng nhập khỏi trình duyệt.",
      ],
      en: [
        "Your sign-in session and display/language preferences are kept in your browser's local storage on your own device. We use no advertising or third-party tracking cookies. Signing out removes the session from the browser.",
      ],
    },
  },
  {
    h: { vi: "6. Lưu trữ và quyền của bạn", en: "6. Retention and your rights" },
    body: {
      vi: [
        "Dữ liệu được giữ trong thời gian tài khoản của bạn còn hoạt động. Bạn có thể xem và sửa hồ sơ bất cứ lúc nào trong mục Cài đặt, và có quyền yêu cầu truy cập, chỉnh sửa hoặc xóa toàn bộ dữ liệu của mình — cách xóa được hướng dẫn ở mục 7 dưới đây.",
      ],
      en: [
        "Data is kept while your account is active. You can view and edit your profile at any time in Settings, and you may request access to, correction of, or deletion of all of your data — deletion is described in section 7 below.",
      ],
    },
  },
  {
    id: "data-deletion",
    h: { vi: "7. Cách xóa dữ liệu của bạn", en: "7. How to delete your data" },
    body: {
      vi: [
        "Để xóa tài khoản và toàn bộ dữ liệu liên quan (hồ sơ, kết quả và thống kê game, bạn bè, lưu bút, bài đăng, đăng ký thông báo đẩy), hãy gửi email tới địa chỉ ở mục Liên hệ từ chính địa chỉ email của tài khoản. Chúng tôi xử lý trong vòng 30 ngày và xác nhận lại bằng email khi hoàn tất. Một số số liệu thống kê tổng hợp đã ẩn danh (ví dụ tổng số ván của toàn hệ thống) có thể được giữ lại vì không còn gắn với cá nhân bạn.",
        "Nếu bạn đăng nhập bằng Facebook, bạn cũng có thể gỡ SynerWorlds khỏi tài khoản Facebook của mình (Cài đặt Facebook → Ứng dụng và trang web) để dừng mọi chia sẻ dữ liệu trong tương lai; việc gỡ này không tự xóa dữ liệu đã lưu ở phía chúng tôi — hãy gửi email như trên nếu muốn xóa hẳn.",
      ],
      en: [
        "To delete your account and all related data (profile, game results and statistics, friends, guestbook entries, posts, push subscriptions), email the contact address below from the email address of your account. We complete deletion within 30 days and confirm by email. Some already-anonymized aggregate statistics (for example total games played across the whole system) may be retained, as they no longer identify you.",
        "If you sign in with Facebook, you can also remove SynerWorlds from your Facebook account (Facebook Settings → Apps and Websites) to stop any future data sharing; removal there does not by itself erase data stored with us — send the email above for full deletion.",
      ],
    },
  },
  {
    h: { vi: "8. Trẻ em", en: "8. Children" },
    body: {
      vi: [
        "Các trò chơi thân thiện với gia đình nhưng dịch vụ không hướng tới trẻ em dưới 13 tuổi. Nếu bạn tin rằng một trẻ em đã cung cấp dữ liệu cho chúng tôi, hãy liên hệ để chúng tôi xóa ngay.",
      ],
      en: [
        "The games are family-friendly, but the service is not directed at children under 13. If you believe a child has provided us with data, contact us and we will delete it.",
      ],
    },
  },
  {
    h: { vi: "9. Thay đổi và liên hệ", en: "9. Changes and contact" },
    body: {
      vi: [
        "Khi chính sách này thay đổi, bản mới sẽ được đăng tại chính trang này kèm ngày cập nhật. Đơn vị vận hành: SynerWork Inc. Mọi câu hỏi về bảo mật và dữ liệu, vui lòng liên hệ:",
      ],
      en: [
        "When this policy changes, the new version will be posted on this very page with its update date. Operated by SynerWork Inc. For any privacy or data question, contact:",
      ],
    },
  },
];

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  return {
    title: TITLE[lang],
    description:
      lang === "vi"
        ? "SynerWorlds thu thập và sử dụng dữ liệu người chơi như thế nào — và cách xóa dữ liệu của bạn."
        : "How SynerWorlds collects and uses player data — and how to delete yours.",
  };
}

export default async function PrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const other: Lang = lang === "vi" ? "en" : "vi";
  return (
    <article style={{ maxWidth: 760 }}>
      <h1 style={{ fontSize: 28, margin: "6px 0 6px" }}>{TITLE[lang]}</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 6px" }}>
        {lang === "vi" ? "Cập nhật lần cuối: " : "Last updated: "}
        {UPDATED[lang]} ·{" "}
        <Link href={`/privacy?lang=${other}`}>
          {other === "en" ? "English version" : "Bản tiếng Việt"}
        </Link>
      </p>
      <p style={{ lineHeight: 1.65 }}>{INTRO[lang]}</p>
      {SECTIONS.map((sec) => (
        <section key={sec.h.en} id={sec.id} style={{ marginTop: 26 }}>
          <h2 style={{ fontSize: 20, margin: "0 0 10px" }}>{sec.h[lang]}</h2>
          {sec.body[lang].map((p) => (
            <p key={p.slice(0, 32)} style={{ lineHeight: 1.65, margin: "0 0 10px" }}>
              {p}
            </p>
          ))}
          {sec.list ? (
            <ul style={{ lineHeight: 1.65, margin: "0 0 10px", paddingLeft: 22 }}>
              {sec.list[lang].map((item) => (
                <li key={item.slice(0, 32)} style={{ marginBottom: 6 }}>
                  {item}
                </li>
              ))}
            </ul>
          ) : null}
          {sec.id === undefined && sec.h.en.startsWith("9.") ? (
            <p style={{ lineHeight: 1.65 }}>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          ) : null}
        </section>
      ))}
    </article>
  );
}
