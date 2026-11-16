import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Product photography.
 *
 * Drop a file into `public/media/` named after the slot and it appears on
 * the site — no code change. For example `public/media/hero.jpg` fills the
 * hero, `public/media/cat-school.webp` fills the school category tile.
 * Until a file exists, `Photo` draws a designed placeholder.
 *
 * Phase 3 adds `product_images.storage_path` from Supabase Storage on top
 * of this, so the shop can upload from the dashboard instead.
 */
/** A slot name. See `public/media/README.md` for the list the site uses. */
export type MediaKey = string;

const EXTENSIONS = [".avif", ".webp", ".jpg", ".jpeg", ".png"];
const MEDIA_DIR = path.join(process.cwd(), "public", "media");

/** Read the folder once per server start, not once per render. */
const available: Map<string, string> = (() => {
  const found = new Map<string, string>();
  let entries: string[];
  try {
    entries = fs.readdirSync(MEDIA_DIR);
  } catch {
    return found;
  }

  for (const extension of EXTENSIONS) {
    for (const entry of entries) {
      const name = path.basename(entry, path.extname(entry));
      if (path.extname(entry).toLowerCase() !== extension) continue;
      if (!found.has(name)) found.set(name, `/media/${entry}`);
    }
  }
  return found;
})();

export function photoSrc(key: MediaKey): string | null {
  return available.get(key) ?? null;
}
