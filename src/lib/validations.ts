import { z } from "zod";

/**
 * Validation schemas shared by the API routes (server-side, authoritative)
 * and the forms (client-side, for instant feedback).
 */

/** Strips HTML tags and control characters. React escapes output as well. */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

const text = (max: number) =>
  z.string().max(max * 2).transform(sanitizeText).pipe(z.string().max(max, `الحد الأقصى ${max} حرفاً`));

const optionalText = (max: number) =>
  z.string().nullish().transform((v) => sanitizeText(v ?? "")).pipe(
    z.string().max(max, `الحد الأقصى ${max} حرفاً`),
  );

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(120, "الرابط المختصر طويل جداً")
  .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, "الرابط المختصر: أحرف إنجليزية صغيرة وأرقام وشرطات فقط");

/**
 * An image reference: an uploaded file URL (https), a site asset (/media/..)
 * or a built-in placeholder key (e.g. "c-4"). javascript:/data: URLs are rejected.
 */
export const imageRefSchema = z
  .string()
  .trim()
  .max(1000)
  .refine(
    (v) => v === "" || /^https:\/\/[^\s"'<>]+$/i.test(v) || /^\/media\/[\w.-]+$/.test(v) || /^[a-z0-9-]{1,40}$/.test(v),
    "رابط الصورة غير صالح (يجب أن يبدأ بـ https://)",
  );

const httpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https:\/\/[^\s"'<>]+$/i.test(v), "يجب أن يبدأ الرابط بـ https://");

const uuid = z.string().uuid("معرّف غير صالح");
const nullableUuid = z.union([uuid, z.literal("")]).nullish().transform((v) => v || null);

const price = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v, ctx) => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(",", "."));
    if (!Number.isFinite(n) || n < 0 || n > 99_999_999) {
      ctx.addIssue({ code: "custom", message: "السعر غير صالح" });
      return z.NEVER;
    }
    return Math.round(n * 100) / 100;
  });

const order = z.coerce.number().int().min(0).max(100_000).default(0);

// ---------------------------------------------------------------------------
// Public contact form
// ---------------------------------------------------------------------------
export const contactMessageSchema = z.object({
  name: z
    .string()
    .max(300)
    .transform(sanitizeText)
    .pipe(z.string().min(2, "يرجى إدخال الاسم (حرفين على الأقل)").max(100, "الاسم طويل جداً")),
  phone: z
    .string()
    .max(60)
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .regex(/^\+?[0-9 ()-]{6,25}$/, "يرجى إدخال رقم هاتف صحيح (أرقام فقط)")
        .refine((v) => v.replace(/\D/g, "").length >= 6, "يرجى إدخال رقم هاتف صحيح"),
    ),
  email: z
    .string()
    .nullish()
    .transform((v) => sanitizeText(v ?? "").toLowerCase())
    .pipe(z.union([z.literal(""), z.string().email("يرجى إدخال بريد إلكتروني صحيح").max(254)])),
  message: z
    .string()
    .max(4000)
    .transform(sanitizeText)
    .pipe(
      z
        .string()
        .min(5, "يرجى كتابة تفاصيل الرسالة (5 أحرف على الأقل)")
        .max(2000, "الرسالة طويلة جداً (2000 حرف كحد أقصى)"),
    ),
  /** Honeypot: hidden from people, filled in by bots. */
  website_honeypot: z.string().max(500).optional(),
  /** Milliseconds the form was open before submitting (bots submit instantly). */
  elapsed_ms: z.coerce.number().optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;

// ---------------------------------------------------------------------------
// Admin login
// ---------------------------------------------------------------------------
export const adminLoginSchema = z.object({
  email: z.string().trim().toLowerCase().email("يرجى إدخال بريد إلكتروني صحيح").max(254),
  password: z.string().min(6, "كلمة المرور مطلوبة").max(200),
});

// ---------------------------------------------------------------------------
// Admin: catalogue
// ---------------------------------------------------------------------------
const specItem = z.object({
  label_ar: text(80),
  label_en: optionalText(80),
  value_ar: text(300),
  value_en: optionalText(300),
});

const variantItem = z.object({
  group_ar: text(80),
  group_en: optionalText(80),
  value_ar: text(200),
  value_en: optionalText(200),
});

export const productInputSchema = z
  .object({
    name_ar: text(200).pipe(z.string().min(2, "اسم المنتج بالعربية مطلوب")),
    name_en: optionalText(200),
    slug: slugSchema.default(""),
    category_id: nullableUuid,
    brand_id: nullableUuid,
    age_stage: z
      .union([z.enum(["primary", "preparatory", "secondary"]), z.literal("")])
      .nullish()
      .transform((v) => v || null),
    short_description_ar: optionalText(500),
    short_description_en: optionalText(500),
    description_ar: optionalText(5000),
    description_en: optionalText(5000),
    sku: optionalText(64),
    display_price: price,
    promotional_price: price,
    media: imageRefSchema.default(""),
    images: z
      .array(z.object({ url: imageRefSchema.pipe(z.string().min(1)), alt: optionalText(200) }))
      .max(12, "الحد الأقصى 12 صورة إضافية")
      .default([]),
    specifications: z.array(specItem).max(40).default([]),
    variants: z.array(variantItem).max(40).default([]),
    seo_title: optionalText(120),
    seo_description: optionalText(320),
    is_featured: z.boolean().default(false),
    is_published: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.promotional_price !== null && v.display_price === null) {
      ctx.addIssue({ code: "custom", path: ["promotional_price"], message: "أدخل السعر الأساسي قبل سعر العرض" });
    }
    if (v.promotional_price !== null && v.display_price !== null && v.promotional_price > v.display_price) {
      ctx.addIssue({ code: "custom", path: ["promotional_price"], message: "سعر العرض يجب أن يكون أقل من السعر الأساسي" });
    }
  });

export type ProductInput = z.infer<typeof productInputSchema>;

export const categoryInputSchema = z.object({
  name_ar: text(120).pipe(z.string().min(2, "اسم القسم بالعربية مطلوب")),
  name_en: optionalText(120),
  slug: slugSchema.default(""),
  description_ar: optionalText(1000),
  description_en: optionalText(1000),
  image_path: imageRefSchema.default(""),
  sort_order: order,
  is_visible: z.boolean().default(true),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

export const brandInputSchema = z.object({
  name_ar: text(120).pipe(z.string().min(1, "اسم العلامة التجارية مطلوب")),
  name_en: optionalText(120),
  slug: slugSchema.default(""),
  description_ar: optionalText(1000),
  website_url: httpsUrl.default(""),
  logo_path: imageRefSchema.default(""),
  is_visible: z.boolean().default(true),
});

export type BrandInput = z.infer<typeof brandInputSchema>;

export const galleryInputSchema = z.object({
  storage_path: imageRefSchema.pipe(z.string().min(1, "الصورة مطلوبة")),
  caption_ar: text(200).pipe(z.string().min(1, "عنوان الصورة مطلوب")),
  caption_en: optionalText(200),
  description: optionalText(1000),
  sort_order: order,
  is_visible: z.boolean().default(true),
});

export type GalleryInput = z.infer<typeof galleryInputSchema>;

// ---------------------------------------------------------------------------
// Admin: settings
// ---------------------------------------------------------------------------
const phoneLike = z
  .string()
  .trim()
  .max(30)
  .refine((v) => v === "" || /^\+?[0-9 ()-]{6,25}$/.test(v), "رقم غير صالح");

export const settingsInputSchema = z
  .object({
    store_name_ar: text(120).pipe(z.string().min(2, "اسم المكتبة مطلوب")),
    store_name_en: optionalText(120),
    logo_url: imageRefSchema,
    phone: phoneLike,
    whatsapp_number: z
      .string()
      .trim()
      .max(30)
      .transform((v) => v.replace(/[^\d]/g, ""))
      .refine((v) => v === "" || /^[1-9]\d{7,14}$/.test(v), "رقم واتساب غير صالح: اكتبه مع كود الدولة بدون + أو أصفار بادئة"),
    email: z.union([z.literal(""), z.string().trim().email("بريد إلكتروني غير صالح").max(254)]),
    address_ar: optionalText(300),
    address_en: optionalText(300),
    working_hours_ar: optionalText(200),
    working_hours_en: optionalText(200),
    map_url: httpsUrl.refine(
      (v) => v === "" || /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/.test(v),
      "استخدم رابط «تضمين خريطة» من خرائط جوجل (يبدأ بـ https://www.google.com/maps/embed)",
    ),
    facebook_url: httpsUrl,
    instagram_url: httpsUrl,
    tiktok_url: httpsUrl,
    x_url: httpsUrl,
    youtube_url: httpsUrl,
    site_description_ar: optionalText(500),
    site_description_en: optionalText(500),
    announcement_ar: optionalText(200),
    announcement_en: optionalText(200),
    seo_title_ar: optionalText(120),
    seo_title_en: optionalText(120),
    seo_description_ar: optionalText(320),
    seo_description_en: optionalText(320),
    seo_keywords: optionalText(500),
    og_image_url: imageRefSchema,
    currency_label: optionalText(20),
    allow_indexing: z.boolean(),
  })
  .partial()
  .required({ store_name_ar: true });

export type SettingsInput = z.infer<typeof settingsInputSchema>;

// ---------------------------------------------------------------------------
// Admin API envelope
// ---------------------------------------------------------------------------
const idPayload = z.object({ id: uuid });

export const adminActionSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("product.create"), payload: z.unknown() }),
  z.object({ op: z.literal("product.update"), payload: z.unknown(), id: uuid }),
  z.object({ op: z.literal("product.delete"), payload: idPayload }),
  z.object({ op: z.literal("product.toggle"), payload: idPayload.extend({ field: z.enum(["is_published", "is_featured"]), value: z.boolean() }) }),
  z.object({ op: z.literal("category.create"), payload: z.unknown() }),
  z.object({ op: z.literal("category.update"), payload: z.unknown(), id: uuid }),
  z.object({ op: z.literal("category.delete"), payload: idPayload }),
  z.object({ op: z.literal("category.reorder"), payload: z.object({ ids: z.array(uuid).max(500) }) }),
  z.object({ op: z.literal("brand.create"), payload: z.unknown() }),
  z.object({ op: z.literal("brand.update"), payload: z.unknown(), id: uuid }),
  z.object({ op: z.literal("brand.delete"), payload: idPayload }),
  z.object({ op: z.literal("gallery.create"), payload: z.unknown() }),
  z.object({ op: z.literal("gallery.update"), payload: z.unknown(), id: uuid }),
  z.object({ op: z.literal("gallery.delete"), payload: idPayload }),
  z.object({ op: z.literal("gallery.reorder"), payload: z.object({ ids: z.array(uuid).max(500) }) }),
  z.object({ op: z.literal("message.mark"), payload: idPayload.extend({ is_read: z.boolean() }) }),
  z.object({ op: z.literal("message.delete"), payload: idPayload }),
  z.object({ op: z.literal("settings.update"), payload: z.unknown() }),
]);

export type AdminAction = z.infer<typeof adminActionSchema>;

/** Flattens Zod issues into { field: message } for the forms. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
