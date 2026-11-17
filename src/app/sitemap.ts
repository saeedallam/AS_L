import type { MetadataRoute } from "next";
import { getCategoriesList, getProductsList } from "@/lib/repository";
import { siteUrl } from "@/lib/supabase/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteUrl();
  const [categories, products] = await Promise.all([getCategoriesList(), getProductsList()]);

  const alternates = (path: string) => ({
    languages: { ar: `${baseUrl}/ar${path}`, en: `${baseUrl}/en${path}` },
  });

  const entries: MetadataRoute.Sitemap = [];
  const staticPaths = ["", "/products", "/categories", "/contact"];

  for (const locale of ["ar", "en"] as const) {
    for (const path of staticPaths) {
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        changeFrequency: "weekly",
        priority: path === "" ? 1 : 0.8,
        alternates: alternates(path),
      });
    }
    for (const category of categories) {
      const path = `/categories/${category.slug}`;
      entries.push({ url: `${baseUrl}/${locale}${path}`, changeFrequency: "weekly", priority: 0.7, alternates: alternates(path) });
    }
    for (const product of products) {
      const path = `/products/${product.slug}`;
      entries.push({
        url: `${baseUrl}/${locale}${path}`,
        lastModified: new Date(product.updated_at || product.created_at),
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: alternates(path),
      });
    }
  }
  return entries;
}
