/**
 * Serialises JSON-LD safely for a <script> tag: "<", ">" and "&" are escaped
 * so stored text can never close the script element (XSS).
 */
export function jsonLdString(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp(" ", "g"), "\\u2028")
    .replace(new RegExp(" ", "g"), "\\u2029");
}

/** Title/description/canonical for a static listing page in both locales. */
export function pageMetadata(locale: string, path: string, title: string, description?: string) {
  const canonical = `/${locale}${path}`;
  return {
    title,
    description,
    alternates: { canonical, languages: { ar: `/ar${path}`, en: `/en${path}`, "x-default": `/ar${path}` } },
    openGraph: { title, description, url: canonical },
    twitter: { title, description },
  };
}
