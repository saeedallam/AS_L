import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminSession } from "@/lib/auth";
import { can } from "@/lib/auth";
import { makeSlug } from "@/lib/slug";
import { removeStoredImages, parseStorageUrl } from "@/lib/storage";
import type {
  BrandRow,
  CategoryRow,
  ContactMessageRow,
  GalleryRow,
  ProductImageRow,
} from "@/types/database";
import type {
  BrandInput,
  CategoryInput,
  GalleryInput,
  ProductInput,
  SettingsInput,
} from "@/lib/validations";
import {
  DEFAULT_SETTINGS,
  PRODUCT_LIST_COLUMNS,
  mapBrand,
  mapCategory,
  mapGallery,
  mapMessage,
  mapProduct,
  mapSettings,
  type AdminSnapshot,
  type ProductRecord,
  type ProductRowWithRelations,
  type WebsiteSettingsRecord,
} from "./records";

/**
 * Admin data access. Every function receives the signed-in admin's Supabase
 * client, so Postgres RLS is the final authority on what may change.
 */
type Db = SupabaseClient;

export class DataError extends Error {
  constructor(
    public readonly code: string | undefined,
    message: string,
  ) {
    super(message);
  }
}

function check<T>(result: { data: T; error: { code?: string; message: string } | null }): T {
  if (result.error) throw new DataError(result.error.code, result.error.message);
  return result.data;
}


// ---------------------------------------------------------------------------
// Image reference safety
// ---------------------------------------------------------------------------
/**
 * Deletes stored files that are no longer referenced anywhere. Called after
 * a successful write, so a replaced or deleted image never leaves a broken
 * reference behind and a shared image is never removed while still in use.
 */
export async function cleanupImages(db: Db, candidates: (string | null | undefined)[]) {
  const urls = [...new Set(candidates.filter((u): u is string => Boolean(u && parseStorageUrl(u))))];
  if (!urls.length) return;

  const stillUsed = new Set<string>();
  const lookups: [string, string][] = [
    ["products", "main_image"],
    ["product_images", "image_url"],
    ["categories", "image_url"],
    ["brands", "logo_url"],
    ["gallery", "image_url"],
    ["site_settings", "setting_value"],
  ];
  await Promise.all(
    lookups.map(async ([table, column]) => {
      const { data } = await db.from(table).select(column).in(column, urls);
      for (const row of (data ?? []) as unknown as Record<string, string>[]) stillUsed.add(row[column]);
    }),
  );
  await removeStoredImages(db, urls.filter((u) => !stillUsed.has(u)));
}

// ---------------------------------------------------------------------------
// Dashboard snapshot
// ---------------------------------------------------------------------------

export type { AdminSnapshot };

export async function loadAdminSnapshot(db: Db, session: AdminSession): Promise<AdminSnapshot> {
  const [products, categories, brands, gallery, messages, settings] = await Promise.all([
    db
      .from("products")
      .select(`${PRODUCT_LIST_COLUMNS}, product_images(*)`)
      .order("created_at", { ascending: false })
      .limit(2000),
    db.from("categories").select("*").order("display_order").order("name_ar"),
    db.from("brands").select("*").order("name"),
    db.from("gallery").select("*").order("display_order").order("created_at"),
    can(session, "messages")
      ? db.from("contact_messages").select("id, name, phone, email, message, is_read, created_at").order("created_at", { ascending: false }).limit(500)
      : Promise.resolve({ data: [], error: null }),
    db.from("site_settings").select("setting_key, setting_value"),
  ]);

  return {
    products: (check(products) as unknown as ProductRowWithRelations[]).map(mapProduct),
    categories: (check(categories) as CategoryRow[]).map(mapCategory),
    brands: (check(brands) as BrandRow[]).map(mapBrand),
    gallery: (check(gallery) as GalleryRow[]).map(mapGallery),
    messages: (check(messages) as ContactMessageRow[]).map(mapMessage),
    settings: settings.error ? DEFAULT_SETTINGS : mapSettings(settings.data ?? []),
  };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
function productColumns(input: ProductInput) {
  return {
    name_ar: input.name_ar,
    name_en: input.name_en || null,
    slug: makeSlug(input.slug, input.name_en, "product"),
    short_description: input.short_description_ar,
    short_description_en: input.short_description_en,
    description: input.description_ar,
    description_en: input.description_en,
    category_id: input.category_id,
    brand_id: input.brand_id,
    age_stage: input.age_stage,
    price: input.display_price,
    sale_price: input.promotional_price,
    sku: input.sku || null,
    specifications: input.specifications,
    variations: input.variants,
    main_image: input.media,
    is_featured: input.is_featured,
    is_active: input.is_published,
    seo_title: input.seo_title || null,
    seo_description: input.seo_description || null,
  };
}

async function syncProductImages(db: Db, productId: string, images: ProductInput["images"]) {
  const existing = check(
    await db.from("product_images").select("*").eq("product_id", productId),
  ) as ProductImageRow[];

  const wanted = new Map(images.map((img, index) => [img.url, { ...img, index }]));
  const removed = existing.filter((row) => !wanted.has(row.image_url));

  if (removed.length) {
    check(await db.from("product_images").delete().in("id", removed.map((r) => r.id)));
  }
  if (images.length) {
    check(
      await db.from("product_images").upsert(
        images.map((img, index) => ({
          product_id: productId,
          image_url: img.url,
          alt_text: img.alt,
          display_order: index,
        })),
        { onConflict: "product_id,image_url" },
      ),
    );
  }
  return removed.map((r) => r.image_url);
}

async function fetchProduct(db: Db, id: string): Promise<ProductRecord> {
  const row = check(
    await db.from("products").select(`${PRODUCT_LIST_COLUMNS}, product_images(*)`).eq("id", id).single(),
  );
  return mapProduct(row as unknown as ProductRowWithRelations);
}

export async function createProduct(db: Db, input: ProductInput): Promise<ProductRecord> {
  const created = check(
    await db.from("products").insert(productColumns(input)).select("id").single(),
  ) as { id: string };
  try {
    await syncProductImages(db, created.id, input.images);
  } catch (error) {
    // Keep the operation atomic from the admin's point of view.
    await db.from("products").delete().eq("id", created.id);
    throw error;
  }
  return fetchProduct(db, created.id);
}

export async function updateProduct(db: Db, id: string, input: ProductInput): Promise<ProductRecord> {
  const before = check(
    await db.from("products").select("main_image").eq("id", id).single(),
  ) as { main_image: string };
  check(await db.from("products").update(productColumns(input)).eq("id", id).select("id").single());
  const removedImages = await syncProductImages(db, id, input.images);
  await cleanupImages(db, [before.main_image !== input.media ? before.main_image : null, ...removedImages]);
  return fetchProduct(db, id);
}

export async function setProductFlag(db: Db, id: string, field: "is_published" | "is_featured", value: boolean) {
  const column = field === "is_published" ? "is_active" : "is_featured";
  check(await db.from("products").update({ [column]: value }).eq("id", id).select("id").single());
  return fetchProduct(db, id);
}

export async function deleteProduct(db: Db, id: string): Promise<void> {
  const product = await fetchProduct(db, id);
  check(await db.from("products").delete().eq("id", id).select("id").single());
  await cleanupImages(db, [product.media, ...product.additional_images]);
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
function categoryColumns(input: CategoryInput) {
  return {
    name_ar: input.name_ar,
    name_en: input.name_en || null,
    slug: makeSlug(input.slug, input.name_en, "category"),
    description: input.description_ar,
    description_en: input.description_en,
    image_url: input.image_path,
    display_order: input.sort_order,
    is_active: input.is_visible,
  };
}

export async function createCategory(db: Db, input: CategoryInput) {
  const row = check(await db.from("categories").insert(categoryColumns(input)).select("*").single());
  return mapCategory(row as CategoryRow);
}

export async function updateCategory(db: Db, id: string, input: CategoryInput) {
  const before = check(await db.from("categories").select("image_url").eq("id", id).single()) as { image_url: string };
  const row = check(await db.from("categories").update(categoryColumns(input)).eq("id", id).select("*").single());
  if (before.image_url !== input.image_path) await cleanupImages(db, [before.image_url]);
  return mapCategory(row as CategoryRow);
}

export async function deleteCategory(db: Db, id: string) {
  const row = check(await db.from("categories").delete().eq("id", id).select("image_url").single()) as { image_url: string };
  await cleanupImages(db, [row.image_url]);
}

export async function reorder(db: Db, table: "categories" | "gallery", ids: string[]) {
  await Promise.all(
    ids.map(async (id, index) => {
      check(await db.from(table).update({ display_order: index + 1 }).eq("id", id).select("id").single());
    }),
  );
}

// ---------------------------------------------------------------------------
// Brands
// ---------------------------------------------------------------------------
function brandColumns(input: BrandInput) {
  return {
    name: input.name_ar,
    name_en: input.name_en || null,
    slug: makeSlug(input.slug, input.name_en || input.name_ar, "brand"),
    description: input.description_ar,
    website_url: input.website_url || null,
    logo_url: input.logo_path,
    is_active: input.is_visible,
  };
}

export async function createBrand(db: Db, input: BrandInput) {
  const row = check(await db.from("brands").insert(brandColumns(input)).select("*").single());
  return mapBrand(row as BrandRow);
}

export async function updateBrand(db: Db, id: string, input: BrandInput) {
  const before = check(await db.from("brands").select("logo_url").eq("id", id).single()) as { logo_url: string };
  const row = check(await db.from("brands").update(brandColumns(input)).eq("id", id).select("*").single());
  if (before.logo_url !== input.logo_path) await cleanupImages(db, [before.logo_url]);
  return mapBrand(row as BrandRow);
}

export async function deleteBrand(db: Db, id: string) {
  const row = check(await db.from("brands").delete().eq("id", id).select("logo_url").single()) as { logo_url: string };
  await cleanupImages(db, [row.logo_url]);
}

// ---------------------------------------------------------------------------
// Gallery
// ---------------------------------------------------------------------------
function galleryColumns(input: GalleryInput) {
  return {
    title: input.caption_ar,
    title_en: input.caption_en,
    image_url: input.storage_path,
    description: input.description,
    display_order: input.sort_order,
    is_active: input.is_visible,
  };
}

export async function createGalleryItem(db: Db, input: GalleryInput) {
  const row = check(await db.from("gallery").insert(galleryColumns(input)).select("*").single());
  return mapGallery(row as GalleryRow);
}

export async function updateGalleryItem(db: Db, id: string, input: GalleryInput) {
  const before = check(await db.from("gallery").select("image_url").eq("id", id).single()) as { image_url: string };
  const row = check(await db.from("gallery").update(galleryColumns(input)).eq("id", id).select("*").single());
  if (before.image_url !== input.storage_path) await cleanupImages(db, [before.image_url]);
  return mapGallery(row as GalleryRow);
}

export async function deleteGalleryItem(db: Db, id: string) {
  const row = check(await db.from("gallery").delete().eq("id", id).select("image_url").single()) as { image_url: string };
  await cleanupImages(db, [row.image_url]);
}

// ---------------------------------------------------------------------------
// Messages (admins only — enforced by RLS too)
// ---------------------------------------------------------------------------
export async function markMessage(db: Db, id: string, isRead: boolean) {
  const row = check(
    await db.from("contact_messages").update({ is_read: isRead }).eq("id", id).select("id, name, phone, email, message, is_read, created_at").single(),
  );
  return mapMessage(row as ContactMessageRow);
}

export async function deleteMessage(db: Db, id: string) {
  check(await db.from("contact_messages").delete().eq("id", id).select("id").single());
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------
export async function updateSettings(db: Db, input: SettingsInput): Promise<WebsiteSettingsRecord> {
  const before = check(await db.from("site_settings").select("setting_key, setting_value")) as {
    setting_key: string;
    setting_value: string;
  }[];
  const previous = mapSettings(before);

  const rows = Object.entries(input)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => ({
      setting_key: key,
      setting_value: typeof value === "boolean" ? String(value) : String(value ?? ""),
    }));
  if (rows.length) {
    check(await db.from("site_settings").upsert(rows, { onConflict: "setting_key" }));
  }

  const replaced = (["logo_url", "og_image_url"] as const)
    .filter((k) => input[k] !== undefined && input[k] !== previous[k])
    .map((k) => previous[k]);
  await cleanupImages(db, replaced);

  const after = check(await db.from("site_settings").select("setting_key, setting_value"));
  return mapSettings(after ?? []);
}
