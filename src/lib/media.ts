import "server-only";
import fs from "node:fs";
import path from "node:path";
import { PLACEHOLDER_PHOTOS } from "./media-placeholders";

export type MediaKey = string;

const EXTENSIONS = [".avif", ".webp", ".jpg", ".jpeg", ".png", ".svg"];
const MEDIA_DIR = path.join(process.cwd(), "public", "media");



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
  if (!key) return null;
  if (
    key.startsWith("http://") ||
    key.startsWith("https://") ||
    key.startsWith("/")
  ) {
    return key;
  }
  return available.get(key) ?? PLACEHOLDER_PHOTOS[key] ?? null;
}
