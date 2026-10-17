import type { Metadata } from "next";
import Link from "next/link";
import { parseLang, type Lang } from "@/lib/i18n";
import ContactForm from "@/components/ContactForm";

/**
 * Contact page — the public way to reach the site owner. The form
 * emails the owner server-side; the address itself is never shown,
 * so it can't be scraped for spam.
 */

const TITLE: Record<Lang, string> = { vi: "Liên hệ", en: "Contact us" };

const INTRO: Record<Lang, string> = {
  vi: "Góp ý, báo lỗi, gặp vấn đề với tài khoản, hay muốn yêu cầu xóa dữ liệu? Hãy dùng biểu mẫu dưới đây — tin nhắn sẽ đến thẳng hộp thư của đội ngũ SynerWorlds. Để chống thư rác và tin nhắn tự động, biểu mẫu chỉ dành cho người chơi đã đăng nhập.",
  en: "Feedback, a bug report, an account problem, or a data deletion request? Use the form below — your message goes straight to the SynerWorlds team's inbox. To stop spam and automated messages, the form is available to signed-in players only.",
};

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
        ? "Liên hệ đội ngũ SynerWorlds qua biểu mẫu."
        : "Contact the SynerWorlds team through the form.",
  };
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const other: Lang = lang === "vi" ? "en" : "vi";
  return (
    <article style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: 28, margin: "6px 0 6px" }}>{TITLE[lang]}</h1>
      <p style={{ color: "var(--muted)", margin: "0 0 6px" }}>
        <Link href={`/contact?lang=${other}`}>
          {other === "en" ? "English version" : "Bản tiếng Việt"}
        </Link>
      </p>
      <p style={{ lineHeight: 1.65 }}>{INTRO[lang]}</p>
      <ContactForm lang={lang} />
    </article>
  );
}
