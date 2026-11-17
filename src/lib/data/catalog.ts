import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type {
  BrandRow,
  CategoryRow,
  GalleryRow,
  AgeStage,
} from "@/types/database";
import {
  DEFAULT_SETTINGS,
  PRODUCT_LIST_COLUMNS,
  mapBrand,
  mapCategory,
  mapGallery,
  mapProduct,
  mapSettings,
  type BrandRecord,
  type CategoryRecord,
  type GalleryRecord,
  type ProductRecord,
  type ProductRowWithRelations,
  type WebsiteSettingsRecord,
} from "./records";

/**
 * Public (visitor) reads. They use the cookie-less anon client, so RLS only
 * ever returns active rows. Results are cached across requests under the
 * "catalog" tag; admin writes call revalidateCatalog() to refresh them.
 */
export const CATALOG_TAG = "catalog";
const REVALIDATE_SECONDS = 600;

function cached<Args extends unknown[], R>(
  name: string,
  fn: (...args: Args) => Promise<R>,
) {
  return unstable_cache(fn, ["asmaa", name], {
    tags: [CATALOG_TAG],
    revalidate: REVALIDATE_SECONDS,
  });
}

/** Lists degrade to a fallback (not cached) when the database is unreachable. */
async function withFallback<T>(label: string, run: () => Promise<T>, fallback: T): Promise<T> {
  if (!isSupabaseConfigured()) return fallback;
  try {
    return await run();
  } catch (error) {
    console.error(`[catalog] ${label} failed:`, error);
    return fallback;
  }
}

function fail(label: string, error: { message: string } | null): never {
  throw new Error(`${label}: ${error?.message ?? "unknown error"}`);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
const loadSettings = cached("settings", async () => {
  const { data, error } = await createPublicClient()
    .from("site_settings")
    .select("setting_key, setting_value");
  if (error) fail("site_settings", error);
  return mapSettings(data ?? []);
});

export const getWebsiteSettings = cache(
  (): Promise<WebsiteSettingsRecord> =>
    withFallback("settings", loadSettings, DEFAULT_SETTINGS),
);

// ---------------------------------------------------------------------------
// Categories / brands / gallery
// ---------------------------------------------------------------------------
const loadCategories = cached("categories", async () => {
  const { data, error } = await createPublicClient()
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .order("name_ar");
  if (error) fail("categories", error);
  return (data as CategoryRow[]).map(mapCategory);
});

export const getCategoriesList = cache(
  (): Promise<CategoryRecord[]> => withFallback("categories", loadCategories, []),
);

const loadBrands = cached("brands", async () => {
  const { data, error } = await createPublicClient()
    .from("brands")
    .select("*")
    .eq("is_active", true)
    .order("name");
  if (error) fail("brands", error);
  return (data as BrandRow[]).map(mapBrand);
});

export const getBrandsList = cache(
  (): Promise<BrandRecord[]> => withFallback("brands", loadBrands, []),
);

const loadGallery = cached("gallery", async () => {
  const { data, error } = await createPublicClient()
    .from("gallery")
    .select("*")
    .eq("is_active", true)
    .order("display_order")
    .order("created_at");
  if (error) fail("gallery", error);
  return (data as GalleryRow[]).map(mapGallery);
});

export const getGalleryList = cache(
  (): Promise<GalleryRecord[]> => withFallback("gallery", loadGallery, []),
);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const loadProducts = cached("products", async () => {
  const { data, error } = await createPublicClient()
    .from("products")
    .select(PRODUCT_LIST_COLUMNS)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1000);
  if (error) fail("products", error);
  return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
});

/** All active products (sitemap, home page, category pages). */
export const getProductsList = cache(
  (): Promise<ProductRecord[]> => withFallback("products", loadProducts, []),
);

const loadProductBySlug = cached("product-by-slug", async (slug: string) => {
  const { data, error } = await createPublicClient()
    .from("products")
    .select(`${PRODUCT_LIST_COLUMNS}, product_images(*)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) fail("product", error);
  return data ? mapProduct(data as unknown as ProductRowWithRelations) : null;
});

/** A single active product with its gallery images, or null (-> 404). */
export const getProductBySlugRecord = cache(
  async (rawSlug: string): Promise<ProductRecord | null> => {
    let slug: string;
    try {
      slug = decodeURIComponent(rawSlug).toLowerCase();
    } catch {
      return null;
    }
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 120) return null;
    if (!isSupabaseConfigured()) return null;
    // Errors propagate to the error boundary instead of becoming a false 404.
    return loadProductBySlug(slug);
  },
);

const loadRelated = cached(
  "related-products",
  async (productId: string, categoryId: string | null, limit: number) => {
    let query = createPublicClient()
      .from("products")
      .select(PRODUCT_LIST_COLUMNS)
      .eq("is_active", true)
      .neq("id", productId)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (categoryId) query = query.eq("category_id", categoryId);
    const { data, error } = await query;
    if (error) fail("related products", error);
    return (data as unknown as ProductRowWithRelations[]).map(mapProduct);
  },
);

export function getRelatedProducts(product: ProductRecord, limit = 5) {
  return withFallback(
    "related products",
    () => loadRelated(product.id, product.category_id, limit),
    [],
  );
}

// ---------------------------------------------------------------------------
// Catalogue search: filtering, sorting and pagination run in SQL
// ---------------------------------------------------------------------------
export type CatalogSort = "newest" | "featured" | "name";

export interface CatalogQuery {
  q: string;
  categoryIds: string[];
  brandIds: string[];
  ages: AgeStage[];
  sort: CatalogSort;
  page: number;
  pageSize: number;
}

export interface CatalogResult {
  items: ProductRecord[];
  total: number;
  page: number;
  pageCount: number;
}

/** Removes characters with meaning in PostgREST filter syntax or LIKE patterns. */
export function toSearchTerm(raw: string): string {
  return raw
    .normalize("NFKC")
    .replace(/[%_*,()\\"'`:;.]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

const runCatalogQuery = cached(
  "catalog-query",
  async (key: string): Promise<CatalogResult> => {
    const params = JSON.parse(key) as CatalogQuery;
    const client = createPublicClient();

    const build = (from: number, to: number) => {
      let query = client
        .from("products")
        .select(PRODUCT_LIST_COLUMNS, { count: "exact" })
        .eq("is_active", true);
      if (params.categoryIds.length) query = query.in("category_id", params.categoryIds);
      if (params.brandIds.length) query = query.in("brand_id", params.brandIds);
      if (params.ages.length) query = query.in("age_stage", params.ages);
      if (params.q) {
        const like = `"%${params.q}%"`; // quoted: the term may contain spaces
        query = query.or(
          `name_ar.ilike.${like},name_en.ilike.${like},sku.ilike.${like},short_description.ilike.${like}`,
        );
      }
      if (params.sort === "name") {
        query = query.order("name_ar", { ascending: true });
      } else if (params.sort === "featured") {
        query = query
          .order("is_featured", { ascending: false })
          .order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }
      return query.order("id").range(from, to);
    };

    const size = params.pageSize;
    let page = Math.max(1, params.page);
    const first = await build((page - 1) * size, page * size - 1);
    let { data, error } = first;
    if (error && error.code !== "PGRST103") fail("catalog", error);

    const total = first.count ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / size));
    if (page > pageCount) {
      // Out-of-range page (e.g. stale link): serve the last page instead.
      page = pageCount;
      ({ data, error } = await build((page - 1) * size, page * size - 1));
      if (error) fail("catalog", error);
    }

    return {
      items: ((data ?? []) as unknown as ProductRowWithRelations[]).map(mapProduct),
      total,
      page,
      pageCount,
    };
  },
);

export function queryCatalog(params: CatalogQuery): Promise<CatalogResult> {
  const normalized: CatalogQuery = {
    ...params,
    q: toSearchTerm(params.q),
    categoryIds: [...params.categoryIds].sort(),
    brandIds: [...params.brandIds].sort(),
    ages: [...params.ages].sort(),
  };
  return withFallback(
    "catalog",
    () => runCatalogQuery(JSON.stringify(normalized)),
    { items: [], total: 0, page: 1, pageCount: 1 },
  );
}

/** Lightweight rows used for filter counts. */
const loadFacets = cached("catalog-facets", async () => {
  const { data, error } = await createPublicClient()
    .from("products")
    .select("category_id, brand_id, age_stage")
    .eq("is_active", true)
    .limit(5000);
  if (error) fail("facets", error);
  return (data ?? []) as { category_id: string | null; brand_id: string | null; age_stage: AgeStage | null }[];
});

export async function getCatalogFacets() {
  const rows = await withFallback("facets", loadFacets, []);
  const count = (field: "category_id" | "brand_id" | "age_stage", value: string) =>
    rows.filter((r) => r[field] === value).length;
  return { count };
}
