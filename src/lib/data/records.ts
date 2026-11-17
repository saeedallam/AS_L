/**
 * View models used by pages and the admin dashboard, plus the pure mapping
 * from database rows. No I/O here, so it is safe to import types from client
 * components.
 */
import type {
  AgeStage,
  BrandRow,
  CategoryRow,
  ContactMessageRow,
  GalleryRow,
  ProductImageRow,
  ProductRow,
  ProductSpecificationItem,
  ProductVariationItem,
} from "@/types/database";

export type { AgeStage } from "@/types/database";
export type ProductSpecRecord = ProductSpecificationItem;
export type ProductVariantRecord = ProductVariationItem;

export interface CategoryRecord {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  image_path: string;
  is_visible: boolean;
  sort_order: number;
}

export interface BrandRecord {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  website_url?: string;
  logo_path: string;
  is_visible: boolean;
  sort_order: number;
}

export interface ProductImageRecord {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface ProductRecord {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  category_id: string | null;
  brand_id: string | null;
  category_slug: string;
  brand_slug: string;
  age_stage: AgeStage | null;
  short_description_ar: string;
  short_description_en: string;
  description_ar: string;
  description_en: string;
  sku?: string;
  display_price?: number | null;
  promotional_price?: number | null;
  media: string;
  images: ProductImageRecord[];
  /** Image URLs of `images`, kept for existing components. */
  additional_images: string[];
  specifications: ProductSpecRecord[];
  variants: ProductVariantRecord[];
  seo_title?: string;
  seo_description?: string;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryRecord {
  id: string;
  storage_path: string;
  caption_ar: string;
  caption_en: string;
  description: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
}

export interface ContactMessageRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

/** Everything the admin dashboard needs on load. */
export interface AdminSnapshot {
  products: ProductRecord[];
  categories: CategoryRecord[];
  brands: BrandRecord[];
  gallery: GalleryRecord[];
  messages: ContactMessageRecord[];
  settings: WebsiteSettingsRecord;
}

/** Every key stored in public.site_settings. */
export const SETTING_KEYS = [
  "store_name_ar",
  "store_name_en",
  "logo_url",
  "phone",
  "whatsapp_number",
  "email",
  "address_ar",
  "address_en",
  "working_hours_ar",
  "working_hours_en",
  "map_url",
  "facebook_url",
  "instagram_url",
  "tiktok_url",
  "x_url",
  "youtube_url",
  "site_description_ar",
  "site_description_en",
  "announcement_ar",
  "announcement_en",
  "seo_title_ar",
  "seo_title_en",
  "seo_description_ar",
  "seo_description_en",
  "seo_keywords",
  "og_image_url",
  "currency_label",
  "allow_indexing",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export type WebsiteSettingsRecord = { [K in Exclude<SettingKey, "allow_indexing">]: string } & {
  allow_indexing: boolean;
};

export const BUSINESS_NAME_AR = "مكتبة أسماء النموذجية";
export const BUSINESS_NAME_EN = "Asmaa Model Library";

export const DEFAULT_SETTINGS: WebsiteSettingsRecord = {
  store_name_ar: BUSINESS_NAME_AR,
  store_name_en: BUSINESS_NAME_EN,
  logo_url: "",
  phone: "",
  whatsapp_number: "",
  email: "",
  address_ar: "",
  address_en: "",
  working_hours_ar: "",
  working_hours_en: "",
  map_url: "",
  facebook_url: "",
  instagram_url: "",
  tiktok_url: "",
  x_url: "",
  youtube_url: "",
  site_description_ar: "",
  site_description_en: "",
  announcement_ar: "",
  announcement_en: "",
  seo_title_ar: BUSINESS_NAME_AR,
  seo_title_en: BUSINESS_NAME_EN,
  seo_description_ar: "",
  seo_description_en: "",
  seo_keywords: "",
  og_image_url: "",
  currency_label: "",
  allow_indexing: true,
};

// ---------------------------------------------------------------------------
// Row -> record mapping
// ---------------------------------------------------------------------------

const toNumber = (v: number | string | null): number | null => {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
};

export function mapCategory(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    slug: row.slug,
    name_ar: row.name_ar,
    name_en: row.name_en ?? "",
    description_ar: row.description,
    description_en: row.description_en,
    image_path: row.image_url,
    is_visible: row.is_active,
    sort_order: row.display_order,
  };
}

export function mapBrand(row: BrandRow, index = 0): BrandRecord {
  return {
    id: row.id,
    slug: row.slug,
    name_ar: row.name,
    name_en: row.name_en ?? "",
    description_ar: row.description,
    description_en: "",
    website_url: row.website_url ?? "",
    logo_path: row.logo_url,
    is_visible: row.is_active,
    sort_order: index + 1,
  };
}

export type ProductRowWithRelations = ProductRow & {
  category?: { slug: string } | null;
  brand?: { slug: string } | null;
  product_images?: ProductImageRow[] | null;
};

export function mapProduct(row: ProductRowWithRelations): ProductRecord {
  const images = [...(row.product_images ?? [])]
    .sort((a, b) => a.display_order - b.display_order)
    .map((img) => ({
      id: img.id,
      url: img.image_url,
      alt: img.alt_text,
      sort_order: img.display_order,
    }));
  return {
    id: row.id,
    slug: row.slug,
    name_ar: row.name_ar,
    name_en: row.name_en ?? "",
    category_id: row.category_id,
    brand_id: row.brand_id,
    category_slug: row.category?.slug ?? "",
    brand_slug: row.brand?.slug ?? "",
    age_stage: row.age_stage,
    short_description_ar: row.short_description,
    short_description_en: row.short_description_en,
    description_ar: row.description,
    description_en: row.description_en,
    sku: row.sku ?? undefined,
    display_price: toNumber(row.price),
    promotional_price: toNumber(row.sale_price),
    media: row.main_image,
    images,
    additional_images: images.map((i) => i.url),
    specifications: Array.isArray(row.specifications) ? row.specifications : [],
    variants: Array.isArray(row.variations) ? row.variations : [],
    seo_title: row.seo_title ?? undefined,
    seo_description: row.seo_description ?? undefined,
    is_featured: row.is_featured,
    is_published: row.is_active,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function mapGallery(row: GalleryRow): GalleryRecord {
  return {
    id: row.id,
    storage_path: row.image_url,
    caption_ar: row.title,
    caption_en: row.title_en,
    description: row.description,
    is_visible: row.is_active,
    sort_order: row.display_order,
    created_at: row.created_at,
  };
}

export function mapMessage(row: ContactMessageRow): ContactMessageRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email ?? undefined,
    message: row.message,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

export function mapSettings(
  rows: { setting_key: string; setting_value: string }[],
): WebsiteSettingsRecord {
  const out: WebsiteSettingsRecord = { ...DEFAULT_SETTINGS };
  const known = new Set<string>(SETTING_KEYS);
  for (const { setting_key, setting_value } of rows) {
    if (!known.has(setting_key)) continue;
    if (setting_key === "allow_indexing") {
      out.allow_indexing = setting_value !== "false";
    } else {
      const key = setting_key as Exclude<SettingKey, "allow_indexing">;
      // Keep defaults for empty name/SEO values so the business name is always present.
      out[key] = setting_value || DEFAULT_SETTINGS[key];
    }
  }
  return out;
}

/** Product columns plus the slugs of the related category and brand. */
export const PRODUCT_LIST_COLUMNS =
  "id, name_ar, name_en, slug, short_description, short_description_en, description, description_en, category_id, brand_id, age_stage, price, sale_price, sku, specifications, variations, main_image, is_featured, is_active, seo_title, seo_description, created_at, updated_at, category:categories(slug), brand:brands(slug)";
