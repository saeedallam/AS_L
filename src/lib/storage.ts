import "server-only";
import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { StorageBucketName } from "@/types/database";
import { supabaseUrl } from "./supabase/env";

/**
 * Supabase Storage helpers. Every call uses the signed-in admin's client, so
 * the storage.objects RLS policies (editors/admins only) are enforced.
 */
export const STORAGE_BUCKETS: readonly StorageBucketName[] = [
  "product-images",
  "category-images",
  "brand-logos",
  "gallery-images",
];

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // keep in sync with bucket file_size_limit

const SIGNATURES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    mime: "image/png",
    ext: "png",
    test: (b) => [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => b[i] === v),
  },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) => ascii(b, 0, 4) === "RIFF" && ascii(b, 8, 12) === "WEBP",
  },
  {
    mime: "image/avif",
    ext: "avif",
    test: (b) => ascii(b, 4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(b, 8, 12)),
  },
];

function ascii(b: Uint8Array, from: number, to: number) {
  return String.fromCharCode(...b.subarray(from, to));
}

export function isValidStorageBucket(bucket: string): bucket is StorageBucketName {
  return (STORAGE_BUCKETS as readonly string[]).includes(bucket);
}

export type ImageCheck =
  | { valid: true; mime: string; ext: string; bytes: Uint8Array }
  | { valid: false; error: string };

/** Validates size, declared type AND the file's real content (magic bytes). */
export async function validateImageFile(file: File): Promise<ImageCheck> {
  if (!file || file.size === 0) return { valid: false, error: "لم يتم اختيار ملف صورة صالح" };
  if (file.size > MAX_IMAGE_BYTES) {
    return { valid: false, error: "حجم الصورة يتجاوز الحد الأقصى (5 ميجابايت)" };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const match = SIGNATURES.find((s) => s.test(bytes));
  if (!match || (file.type && file.type.toLowerCase() !== match.mime && !(file.type === "image/jpg" && match.mime === "image/jpeg"))) {
    return { valid: false, error: "نوع الملف غير مدعوم. المسموح: JPG و PNG و WebP و AVIF" };
  }
  return { valid: true, mime: match.mime, ext: match.ext, bytes };
}

/** Uploads under a random, unguessable name: <yyyy>/<mm>/<uuid>.<ext>. */
export async function uploadImage(
  supabase: SupabaseClient,
  bucket: StorageBucketName,
  file: File,
): Promise<{ url: string; path: string }> {
  const check = await validateImageFile(file);
  if (!check.valid) throw new UploadError(check.error);

  const now = new Date();
  const path = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${check.ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, check.bytes, {
    contentType: check.mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new UploadError("تعذر رفع الصورة إلى التخزين", error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export class UploadError extends Error {
  constructor(
    public readonly userMessage: string,
    detail?: string,
  ) {
    super(detail ?? userMessage);
  }
}

/** Parses one of our public storage URLs into bucket + object path. */
export function parseStorageUrl(url: string): { bucket: StorageBucketName; path: string } | null {
  if (!url) return null;
  const prefix = `${supabaseUrl().replace(/\/+$/, "")}/storage/v1/object/public/`;
  if (!url.startsWith(prefix)) return null;
  const rest = url.slice(prefix.length).split("?")[0];
  const slash = rest.indexOf("/");
  if (slash <= 0) return null;
  const bucket = rest.slice(0, slash);
  const path = decodeURIComponent(rest.slice(slash + 1));
  if (!isValidStorageBucket(bucket) || !path || path.includes("..")) return null;
  return { bucket, path };
}

/** Deletes stored files. Non-storage values (placeholders, external URLs) are ignored. */
export async function removeStoredImages(supabase: SupabaseClient, urls: string[]): Promise<void> {
  const byBucket = new Map<StorageBucketName, string[]>();
  for (const url of new Set(urls)) {
    const parsed = parseStorageUrl(url);
    if (!parsed) continue;
    byBucket.set(parsed.bucket, [...(byBucket.get(parsed.bucket) ?? []), parsed.path]);
  }
  await Promise.all(
    [...byBucket].map(async ([bucket, paths]) => {
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) console.error(`[storage] failed to remove from ${bucket}:`, error.message);
    }),
  );
}
