import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { siteUrl } from "@/lib/data";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "SynerWorlds — Cổng game trí tuệ SynerWork",
    template: "%s · SynerWorlds",
  },
  description:
    "SynerWorlds — cổng chung của các trò chơi trí tuệ SynerWork: Cờ Tướng, Cờ Vua, Cờ Chiếu Tướng, Cờ Gánh. Một hồ sơ kỳ thủ xuyên mọi game.",
  openGraph: {
    siteName: "SynerWorlds",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <header className="site-header">
          <Link href="/" className="brand" aria-label="SynerWorlds">
            <span className="brand-mark" aria-hidden>
              <span className="bm-red" />
              <span className="bm-blue" />
            </span>
            <span className="brand-name">
              Syner<em>Worlds</em>
            </span>
          </Link>
          <nav className="site-nav">
            <Link href="/">Trang chủ</Link>
            <Link href="/rooms">Phòng chơi</Link>
            <Link href="/#games">Trò chơi</Link>
            <Link href="/#top">Cao thủ</Link>
          </nav>
        </header>
        <main className="page">{children}</main>
        <footer className="site-footer">
          <p>
            SynerWorlds · Một tài khoản, mọi bàn cờ —{" "}
            <a href="https://pacclone.vercel.app">Cờ Tướng</a> ·{" "}
            <a href="https://chess-my-cheese-vn.vercel.app">Cờ Vua</a> ·{" "}
            <a href="https://cochieutuong-my-cheese-vn.vercel.app">
              Cờ Chiếu Tướng
            </a>{" "}
            · <a href="https://coganh-my-cheese-vn.vercel.app">Cờ Gánh</a>
          </p>
        </footer>
      </body>
    </html>
  );
}
