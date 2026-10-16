import type { Metadata } from "next";
import { parseLang } from "@/lib/i18n";
import SettingsClient from "@/components/SettingsClient";

export const metadata: Metadata = {
  title: "Hồ sơ & Cài đặt · SynerWorlds",
  robots: { index: false },
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  return <SettingsClient lang={lang} />;
}
