import type { Metadata } from "next";
import { getHubHome, getLfgPosts } from "@/lib/data";
import { parseLang, s } from "@/lib/i18n";
import LfgBoard from "@/components/LfgBoard";

export const revalidate = 20;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  return {
    title: `${s("lfgHeading", lang)} · SynerWorlds`,
    description: s("lfgSub", lang),
  };
}

export default async function LfgPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const sp = await searchParams;
  const lang = parseLang(sp.lang);
  const [home, initial] = await Promise.all([
    getHubHome(),
    getLfgPosts(null, 10, 0),
  ]);
  const games = home?.games ?? [];
  return (
    <>
      <h1 style={{ fontSize: 28, margin: "6px 0 6px" }}>
        {s("lfgHeading", lang)}
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 18px", maxWidth: 640 }}>
        {s("lfgSub", lang)}
      </p>
      <LfgBoard lang={lang} games={games} initial={initial} />
    </>
  );
}
