"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseLang, type Lang } from "@/lib/i18n";

/**
 * Site footer — bilingual, follows the hub's ?lang= convention
 * (default vi). The layout can't see search params, so the language
 * is resolved client-side from the URL on mount and on navigation.
 */

const T = {
  tagline: {
    vi: "SynerWorlds - Một tài khoản, mọi bàn cờ.",
    en: "SynerWorlds - One account, every board.",
  },
  games: {
    vi: "Cờ vua, cờ tướng, cờ chiếu tướng, cờ gánh, cờ nhào, ô ăn quan,...",
    en: "Chess, Xiangqi, Vietnamese General Check, Co Ganh, Co Nhao, O An Quan,...",
  },
  terms: { vi: "Điều khoản dịch vụ", en: "Terms of Service" },
  privacy: { vi: "Chính sách bảo mật", en: "Privacy Policy" },
  contact: { vi: "Liên hệ", en: "Contact" },
  rights: {
    vi: "© SynerWork Inc. Bảo lưu mọi quyền.",
    en: "© SynerWork Inc. All rights reserved.",
  },
};

export default function SiteFooter() {
  const pathname = usePathname();
  const [lang, setLang] = useState<Lang>("vi");

  useEffect(() => {
    setLang(
      parseLang(new URLSearchParams(window.location.search).get("lang")),
    );
  }, [pathname]);

  const q = lang === "en" ? "?lang=en" : "";
  return (
    <footer className="site-footer">
      <p style={{ margin: "0 0 6px", fontWeight: 600, color: "inherit" }}>
        {T.tagline[lang]}
      </p>
      <p style={{ margin: "0 0 10px" }}>{T.games[lang]}</p>
      <p style={{ margin: "0 0 10px" }}>
        <Link href={`/terms${q}`}>{T.terms[lang]}</Link>
        {" · "}
        <Link href={`/privacy${q}`}>{T.privacy[lang]}</Link>
        {" · "}
        <Link href={`/contact${q}`}>{T.contact[lang]}</Link>
      </p>
      <p style={{ margin: 0 }}>{T.rights[lang]}</p>
    </footer>
  );
}
