"use client";

import type { AdminSnapshot } from "@/lib/data/records";

/** Typed client for the admin API. Every call is re-authorised server-side. */
export type ApiResult<T = unknown> =
  | { ok: true; item: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string>; status: number };

async function call<T>(input: RequestInfo, init: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(input, { ...init, credentials: "same-origin", cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && typeof window !== "undefined") {
      window.location.replace(`${window.location.origin}/ar/admin/login`);
    }
    if (!res.ok || data.ok === false) {
      return {
        ok: false,
        status: res.status,
        error: data.error || "تعذر تنفيذ العملية",
        fieldErrors: data.fieldErrors,
      };
    }
    return { ok: true, item: data.item as T };
  } catch {
    return { ok: false, status: 0, error: "تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً." };
  }
}

export function adminAction<T = unknown>(op: string, payload: unknown, id?: string) {
  return call<T>("/api/admin/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(id ? { op, id, payload } : { op, payload }),
  });
}

export async function loadSnapshot(): Promise<AdminSnapshot | null> {
  try {
    const res = await fetch("/api/admin/data", { cache: "no-store", credentials: "same-origin" });
    if (res.status === 401) {
      window.location.replace(`${window.location.origin}/ar/admin/login`);
      return null;
    }
    if (!res.ok) return null;
    return (await res.json()) as AdminSnapshot;
  } catch {
    return null;
  }
}

export type UploadBucket = "product-images" | "category-images" | "brand-logos" | "gallery-images";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/avif";

export async function uploadFile(
  file: File,
  bucket: UploadBucket,
  purpose: "catalog" | "settings" = "catalog",
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, error: "حجم الصورة يتجاوز 5 ميجابايت" };
  if (!ACCEPTED_IMAGES.split(",").includes(file.type)) {
    return { ok: false, error: "المسموح: صور JPG أو PNG أو WebP أو AVIF" };
  }
  const fd = new FormData();
  fd.append("file", file);
  fd.append("bucket", bucket);
  fd.append("purpose", purpose);
  try {
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd, credentials: "same-origin" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) return { ok: false, error: data.error || "تعذر رفع الصورة" };
    return { ok: true, url: data.url as string };
  } catch {
    return { ok: false, error: "تعذر الاتصال بالخادم أثناء رفع الصورة" };
  }
}

/** Removes an uploaded file that was never saved (server keeps it if referenced). */
export function discardUpload(url: string) {
  if (!url.includes("/storage/v1/object/public/")) return;
  void fetch(`/api/admin/upload?url=${encodeURIComponent(url)}`, {
    method: "DELETE",
    credentials: "same-origin",
  }).catch(() => undefined);
}
