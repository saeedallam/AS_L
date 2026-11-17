/**
 * Centralised WhatsApp inquiry links (Phase 9). The number is configured by
 * the admin in site settings; it is never hard-coded or invented here.
 */
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");

/** wa.me only accepts digits with the country code (no +, spaces or leading zeros). */
export function normalizeWhatsAppNumber(number: string | null | undefined): string {
  return (number || "").replace(/\D/g, "").replace(/^0+/, "");
}

/**
 * Builds a WhatsApp link. Without a configured number it returns null, or a
 * share link (the visitor picks the contact) when `allowShareFallback` is set.
 */
export function buildWhatsAppUrl(
  number: string,
  message?: string,
  allowShareFallback = false,
): string | null {
  const digits = normalizeWhatsAppNumber(number);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  if (digits.length >= 8) return `https://wa.me/${digits}${text}`;
  if (allowShareFallback && message) return `https://api.whatsapp.com/send${text}`;
  return null;
}

export function productPageUrl(locale: string, slug: string): string {
  return `${SITE_URL}/${locale === "en" ? "en" : "ar"}/products/${encodeURIComponent(slug)}`;
}

/**
 * The polite Arabic inquiry message:
 *   السلام عليكم، أريد الاستفسار عن المنتج: [اسم المنتج]
 *   [رابط المنتج]
 */
export function buildProductWhatsAppMessage(params: {
  locale: string;
  productName: string;
  slug: string;
}): string {
  return `السلام عليكم، أريد الاستفسار عن المنتج: ${params.productName}\n\n${productPageUrl(params.locale, params.slug)}`;
}

/** Optional price display: "25" + configured currency label (if any). */
export function formatPrice(value: number | null | undefined, currencyLabel = ""): string {
  if (value === null || value === undefined) return "";
  const amount = Number.isInteger(value) ? String(value) : value.toFixed(2);
  return currencyLabel ? `${amount} ${currencyLabel}` : amount;
}
