import type { MetadataRoute } from "next";
import { getWebsiteSettings } from "@/lib/repository";
import { siteUrl } from "@/lib/supabase/env";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const baseUrl = siteUrl();
  const settings = await getWebsiteSettings();
  // Production indexing is also blocked automatically on Vercel preview deployments.
  const allow = settings.allow_indexing !== false && process.env.VERCEL_ENV !== "preview";

  return {
    rules: allow
      ? { userAgent: "*", allow: "/", disallow: ["/ar/admin", "/en/admin", "/api/"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
