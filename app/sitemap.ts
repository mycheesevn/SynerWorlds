import type { MetadataRoute } from "next";
import { getSitemapHandles, siteUrl } from "@/lib/data";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const handles = await getSitemapHandles();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/rooms`, changeFrequency: "hourly", priority: 0.8 },
    ...handles.map((h) => ({
      url: `${base}/u/${encodeURIComponent(h)}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
