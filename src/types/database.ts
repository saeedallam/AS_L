/**
 * Row types for the Supabase schema
 * (supabase/migrations/20261117172845_showcase_schema.sql).
 */

export type AdminRole = "admin" | "editor" | "viewer";
export type AgeStage = "primary" | "preparatory" | "secondary";

export interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: AdminRole;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string;
  description: string;
  description_en: string;
  image_url: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface BrandRow {
  id: string;
  name: string;
  name_en: string | null;
  slug: string;
  description: string;
  logo_url: string;
  website_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductSpecificationItem {
  label_ar: string;
  label_en?: string;
  value_ar: string;
  value_en?: string;
}

export interface ProductVariationItem {
  group_ar: string;
  group_en?: string;
  value_ar: string;
  value_en?: string;
}

export interface ProductRow {
  id: string;
  name_ar: string;
  name_en: string | null;
  slug: string;
  short_description: string;
  short_description_en: string;
  description: string;
  description_en: string;
  category_id: string | null;
  brand_id: string | null;
  age_stage: AgeStage | null;
  price: number | string | null; // numeric arrives as string from PostgREST
  sale_price: number | string | null;
  sku: string | null;
  specifications: ProductSpecificationItem[];
  variations: ProductVariationItem[];
  main_image: string;
  is_featured: boolean;
  is_active: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  created_at: string;
}

export interface GalleryRow {
  id: string;
  title: string;
  title_en: string;
  image_url: string;
  description: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ContactMessageRow {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SiteSettingRow {
  id: string;
  setting_key: string;
  setting_value: string;
  updated_at: string;
}

export type StorageBucketName =
  | "product-images"
  | "category-images"
  | "brand-logos"
  | "gallery-images";
