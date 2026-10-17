import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { siteUrl } from "@/lib/data";
import AuthBar from "@/components/AuthBar";
import SynerLogo from "@/components/SynerLogo";
import SiteFooter from "@/components/SiteFooter";

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
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
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
            <SynerLogo size={38} />
            <span className="brand-name">
              Syner<em>Worlds</em>
            </span>
          </Link>
          <nav className="site-nav">
            <Link href="/">Trang chủ</Link>
            <Link href="/rooms">Phòng chơi</Link>
            <Link href="/tim-doi-thu">Tìm đối thủ</Link>
            <Link href="/#games">Trò chơi</Link>
            <Link href="/#top">Cao thủ</Link>
            <AuthBar />
          </nav>
        </header>
        <main className="page">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
