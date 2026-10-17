import type { Metadata } from "next";
import Link from "next/link";
import { parseLang, type Lang } from "@/lib/i18n";

/**
 * Terms of Service — companion to /privacy (Meta app settings ask for
 * both URLs). Self-contained bilingual content; language follows the
 * hub's ?lang= convention (default vi). Applies to the hub + all
 * SynerWork games, which share one account system.
 */

const UPDATED = { vi: "17 tháng 10, 2026", en: "October 17, 2026" };

type Section = {
  id?: string;
  h: Record<Lang, string>;
  body: Record<Lang, string[]>;
  list?: Record<Lang, string[]>;
};

const TITLE: Record<Lang, string> = {
  vi: "Điều khoản sử dụng",
  en: "Terms of Service",
};

const INTRO: Record<Lang, string> = {
  vi: "Chào mừng bạn đến với SynerWorlds — cổng game trí tuệ miễn phí trên nền web của SynerWork Inc., gồm trang hub này và các trò chơi Cờ Tướng, Cờ Vua, Cờ Chiếu Tướng, Cờ Gánh, Cờ Nhào, Ô Ăn Quan, Cờ Cá Ngựa, Sudoku, Cross Words và Word Search. Khi sử dụng dịch vụ, bạn đồng ý với các điều khoản dưới đây. Nếu không đồng ý, vui lòng không sử dụng dịch vụ.",
  en: "Welcome to SynerWorlds — the free, web-based strategy-games portal of SynerWork Inc., comprising this hub and the games Xiangqi, Chess, Vietnamese General Check, Co Ganh, Co Nhao, O An Quan, Ca Ngua, Sudoku, Cross Words and Word Search. By using the service you agree to the terms below. If you do not agree, please do not use the service.",
};

const SECTIONS: Section[] = [
  {
    h: { vi: "1. Dịch vụ", en: "1. The service" },
    body: {
      vi: [
        "Tất cả trò chơi chơi trực tiếp trên trình duyệt, miễn phí, không cần cài đặt. Chúng tôi có thể thêm, thay đổi hoặc ngừng một trò chơi hay tính năng bất cứ lúc nào; dịch vụ được cung cấp trên cơ sở nỗ lực tốt nhất, không cam kết thời gian hoạt động liên tục. Cách chúng tôi xử lý dữ liệu của bạn được mô tả trong Chính sách bảo mật.",
      ],
      en: [
        "All games are played directly in your browser, free of charge, with nothing to install. We may add, change or discontinue a game or feature at any time; the service is provided on a best-effort basis with no uptime guarantee. How we handle your data is described in the Privacy Policy.",
      ],
    },
  },
  {
    h: { vi: "2. Tài khoản", en: "2. Accounts" },
    body: {
      vi: [],
      en: [],
    },
    list: {
      vi: [
        "Bạn có thể chơi với tư cách khách, hoặc đăng ký tài khoản bằng email, Google hay Facebook để lưu tiến trình và chơi cùng bạn bè.",
        "Bạn chịu trách nhiệm với mọi hoạt động diễn ra dưới tài khoản của mình và cần giữ thông tin đăng nhập an toàn.",
        "Thông tin đăng ký phải trung thực; không mạo danh người khác.",
        "Chúng tôi có thể tạm khóa hoặc xóa tài khoản vi phạm các điều khoản này, đặc biệt là hành vi gian lận và quấy rối.",
      ],
      en: [
        "You may play as a guest, or register an account with email, Google or Facebook to save progress and play with friends.",
        "You are responsible for all activity under your account and must keep your sign-in credentials safe.",
        "Registration information must be truthful; do not impersonate anyone else.",
        "We may suspend or remove accounts that violate these terms, especially for cheating or harassment.",
      ],
    },
  },
  {
    h: { vi: "3. Chơi công bằng và hành vi", en: "3. Fair play and conduct" },
    body: {
      vi: ["Khi sử dụng dịch vụ, bạn đồng ý KHÔNG:"],
      en: ["When using the service, you agree NOT to:"],
    },
    list: {
      vi: [
        "Dùng chương trình gian lận, bot tự chơi hộ, hay bất kỳ công cụ nào thao túng kết quả ván đấu, XP hoặc rating.",
        "Khai thác lỗi của trò chơi để trục lợi — nếu phát hiện lỗi, hãy báo cho chúng tôi thay vì lợi dụng nó.",
        "Quấy rối, xúc phạm, spam hoặc đăng nội dung trái pháp luật trong lưu bút, bình luận, bài tìm đối thủ và các khu vực cộng đồng khác.",
        "Thu thập dữ liệu tự động hàng loạt, phá hoại máy chủ, hoặc làm gián đoạn ván chơi của người khác.",
      ],
      en: [
        "Use cheat programs, self-playing bots, or any tool that manipulates game results, XP or ratings.",
        "Exploit bugs for advantage — if you find one, report it to us instead of abusing it.",
        "Harass, insult, spam or post unlawful content in the guestbook, comments, looking-for-opponent posts and other community areas.",
        "Scrape data in bulk, attack the servers, or disrupt other players' games.",
      ],
    },
  },
  {
    h: { vi: "4. Nội dung của bạn", en: "4. Your content" },
    body: {
      vi: [
        "Nội dung bạn đăng (tên hiển thị, ảnh đại diện, lời nhắn lưu bút, bình luận, bài tìm đối thủ) vẫn là của bạn; bạn cấp cho chúng tôi quyền hiển thị nội dung đó trong phạm vi dịch vụ. Bạn chịu trách nhiệm với nội dung mình đăng, và chúng tôi có thể gỡ nội dung vi phạm điều khoản mà không cần báo trước.",
        "Với câu đố hoặc nội dung bạn đóng góp cho thư viện cộng đồng: bạn giữ quyền sở hữu, đồng thời cấp cho SynerWork quyền sử dụng và đăng tải kèm ghi danh tác giả trong các trò chơi. Ghi danh không tạo ra nghĩa vụ trả phí.",
      ],
      en: [
        "Content you post (display name, avatar, guestbook messages, comments, looking-for-opponent posts) remains yours; you grant us the right to display it within the service. You are responsible for what you post, and we may remove content that violates these terms without prior notice.",
        "For puzzles or content you contribute to the community library: you keep ownership, and grant SynerWork the right to use and publish it, with author credit, in the games. Credit does not create any obligation of payment.",
      ],
    },
  },
  {
    h: { vi: "5. XP, rating và vật phẩm trong game", en: "5. XP, ratings and in-game items" },
    body: {
      vi: [
        "XP, rating, cấp độ, danh hiệu và mọi vật phẩm trong game là một phần của trò chơi: chúng không có giá trị tiền tệ, không chuyển nhượng, không quy đổi thành tiền hay hiện vật. Các trò chơi hoàn toàn không có yếu tố cờ bạc, đặt cược hay nạp tiền ăn tiền.",
      ],
      en: [
        "XP, ratings, levels, titles and all in-game items are part of the games: they have no monetary value, are not transferable, and cannot be exchanged for money or goods. The games involve no gambling, betting or real-money play of any kind.",
      ],
    },
  },
  {
    h: { vi: "6. Sở hữu trí tuệ", en: "6. Intellectual property" },
    body: {
      vi: [
        "Các trò chơi, giao diện, đồ họa, mã nguồn và thương hiệu SynerWorlds/SynerWork thuộc về SynerWork Inc. Bạn không được sao chép, phân phối lại hoặc dùng vào mục đích thương mại khi chưa có sự đồng ý bằng văn bản, trừ phạm vi pháp luật cho phép.",
      ],
      en: [
        "The games, interfaces, artwork, code and the SynerWorlds/SynerWork brands belong to SynerWork Inc. You may not copy, redistribute or use them commercially without written consent, beyond what the law permits.",
      ],
    },
  },
  {
    h: { vi: "7. Tuyên bố miễn trừ", en: "7. Disclaimer" },
    body: {
      vi: [
        "Dịch vụ được cung cấp theo nguyên trạng (\"as is\"). Trong phạm vi tối đa pháp luật cho phép, chúng tôi không bảo đảm dịch vụ không có lỗi hay gián đoạn, và không chịu trách nhiệm với thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ. Kết quả ván đấu và thống kê được hệ thống ghi nhận theo dữ liệu máy chủ; quyết định của hệ thống trong các tranh chấp về kết quả là quyết định cuối cùng.",
      ],
      en: [
        "The service is provided \"as is\". To the maximum extent permitted by law, we do not warrant that the service will be error-free or uninterrupted, and we are not liable for indirect damages arising from use of the service. Game results and statistics are recorded by the server, and the system's record is final in any dispute over results.",
      ],
    },
  },
  {
    h: { vi: "8. Chấm dứt", en: "8. Termination" },
    body: {
      vi: [
        "Bạn có thể ngừng sử dụng và yêu cầu xóa tài khoản bất cứ lúc nào theo hướng dẫn trong Chính sách bảo mật. Chúng tôi có thể chấm dứt quyền truy cập của tài khoản vi phạm; các mục về sở hữu trí tuệ, nội dung và tuyên bố miễn trừ vẫn giữ hiệu lực sau khi chấm dứt.",
      ],
      en: [
        "You may stop using the service and request account deletion at any time, as described in the Privacy Policy. We may terminate access for violating accounts; the sections on intellectual property, content and disclaimers survive termination.",
      ],
    },
  },
  {
    h: { vi: "9. Thay đổi điều khoản và liên hệ", en: "9. Changes and contact" },
    body: {
      vi: [
        "Khi điều khoản thay đổi, bản mới sẽ được đăng tại chính trang này kèm ngày cập nhật; việc bạn tiếp tục sử dụng dịch vụ đồng nghĩa với việc chấp nhận bản mới. Mọi câu hỏi về điều khoản, vui lòng liên hệ đơn vị vận hành — SynerWork Inc. — qua biểu mẫu liên hệ (địa chỉ email của chúng tôi không đăng công khai để tránh thư rác):",
      ],
      en: [
        "When these terms change, the new version will be posted on this very page with its update date; continuing to use the service means accepting the new version. For any question about these terms, contact the operator — SynerWork Inc. — through the contact form (our email address is not published, to avoid spam):",
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
        ? "Điều khoản sử dụng dịch vụ SynerWorlds và các trò chơi SynerWork."
        : "The terms for using SynerWorlds and the SynerWork games.",
  };
}

export default async function TermsPage({
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
        <Link href={`/terms?lang=${other}`}>
          {other === "en" ? "English version" : "Bản tiếng Việt"}
        </Link>
      </p>
      <p style={{ lineHeight: 1.65 }}>{INTRO[lang]}</p>
      {SECTIONS.map((sec) => (
        <section key={sec.h.en} style={{ marginTop: 26 }}>
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
          {sec.h.en.startsWith("9.") ? (
            <p style={{ lineHeight: 1.65 }}>
              <Link href={lang === "en" ? "/contact?lang=en" : "/contact"}>
                {lang === "vi" ? "→ Mở biểu mẫu liên hệ" : "→ Open the contact form"}
              </Link>
              {" · "}
              <Link href={lang === "en" ? "/privacy?lang=en" : "/privacy"}>
                {lang === "vi" ? "Chính sách bảo mật" : "Privacy Policy"}
              </Link>
            </p>
          ) : null}
        </section>
      ))}
    </article>
  );
}
