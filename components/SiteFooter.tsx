"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { parseLang, type Lang } from "@/lib/i18n";
import HandoffLink from "@/components/HandoffLink";

/**
 * Site footer — bilingual, follows the hub's ?lang= convention
 * (default vi). The layout can't see search params, so the language
 * is resolved client-side from the URL on mount and on navigation.
 */

const T = {
  tagline: {
    vi: "SynerWorlds - Một tài khoản, mọi bàn cờ.",
    en: "SynerWorlds - One account, every world.",
  },
  terms: { vi: "Điều khoản dịch vụ", en: "Terms of Service" },
  privacy: { vi: "Chính sách bảo mật", en: "Privacy Policy" },
  contact: { vi: "Liên hệ", en: "Contact" },
  rights: {
    vi: "© SynerWork Inc. Bảo lưu mọi quyền.",
    en: "© SynerWork Inc. All rights reserved.",
  },
};

/** The games named in the footer line, in the user's order — each
 *  links into the game (HandoffLink carries the login for signed-in
 *  players, exactly like the game cards). URLs = game_registry. */
const FOOTER_GAMES: { vi: string; en: string; url: string }[] = [
  { vi: "Cờ vua", en: "Chess", url: "https://chess-my-cheese-vn.vercel.app" },
  { vi: "cờ tướng", en: "Xiangqi", url: "https://pacclone.vercel.app" },
  { vi: "cờ chiếu tướng", en: "Vietnamese General Check", url: "https://cochieutuong-my-cheese-vn.vercel.app" },
  { vi: "cờ gánh", en: "Co Ganh", url: "https://coganh-my-cheese-vn.vercel.app" },
  { vi: "cờ nhào", en: "Co Nhao", url: "https://conhao-my-cheese-vn.vercel.app" },
  { vi: "ô ăn quan", en: "O An Quan", url: "https://oanquan-my-cheese-vn.vercel.app" },
];

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
      <p style={{ margin: "0 0 10px" }}>
        {FOOTER_GAMES.map((g, i) => (
          <span key={g.url}>
            {i > 0 ? ", " : ""}
            <HandoffLink href={g.url}>{g[lang]}</HandoffLink>
          </span>
        ))}
        ,...
      </p>
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
