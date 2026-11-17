import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireAdmin } from "@/lib/api/http";
import { cleanupImages } from "@/lib/data/admin";
import {
  MAX_IMAGE_BYTES,
  UploadError,
  isValidStorageBucket,
  parseStorageUrl,
  uploadImage,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

/** Upload one image to a showcase bucket. Returns its public URL. */
export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_IMAGE_BYTES + 64 * 1024) {
    return jsonError(413, "حجم الصورة يتجاوز الحد الأقصى (5 ميجابايت)");
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError(400, "طلب غير صالح");
  }

  const bucket = String(form.get("bucket") ?? "");
  if (!isValidStorageBucket(bucket)) return jsonError(400, "وجهة التخزين غير صالحة");

  // Logos and site images are settings (admins only); catalogue images need editor rights.
  const permission = form.get("purpose") === "settings" ? "settings" : "catalog";
  const guard = await requireAdmin(request, permission, { mutating: true });
  if (!guard.ok) return guard.response;

  const file = form.get("file");
  if (!(file instanceof File)) return jsonError(400, "لم يتم اختيار صورة");

  try {
    const { url } = await uploadImage(guard.supabase, bucket, file);
    return NextResponse.json({ ok: true, url, bucket });
  } catch (error) {
    if (error instanceof UploadError) return jsonError(400, error.userMessage);
    console.error("[admin/upload] failed:", error);
    return jsonError(500, "تعذر رفع الصورة");
  }
}

/**
 * Discard an uploaded image that was never saved (e.g. the form was
 * cancelled). Files still referenced by any record are kept.
 */
export async function DELETE(request: NextRequest) {
  const guard = await requireAdmin(request, "catalog", { mutating: true });
  if (!guard.ok) return guard.response;

  const url = new URL(request.url).searchParams.get("url") ?? "";
  if (!parseStorageUrl(url)) return jsonError(400, "رابط غير صالح");

  await cleanupImages(guard.supabase, [url]);
  return NextResponse.json({ ok: true });
}
