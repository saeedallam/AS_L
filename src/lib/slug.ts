import crypto from "node:crypto";

/** Turns a name into a URL slug; Arabic-only names get a short random slug. */
export function makeSlug(preferred: string, fallbackSource: string, prefix: string): string {
  const base = (preferred || fallbackSource)
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
  return base.length >= 2 ? base : `${prefix}-${crypto.randomBytes(3).toString("hex")}`;
}
