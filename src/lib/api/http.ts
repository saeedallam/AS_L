import "server-only";
import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { can, getAdminSession, type AdminSession, type Permission } from "@/lib/auth";
import { createSessionClient } from "@/lib/supabase/server";

export function jsonError(status: number, error: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error, ...extra }, { status });
}

/**
 * CSRF defence for cookie-authenticated, state-changing requests: the
 * request must come from this site's own origin. (Session cookies are also
 * SameSite=Lax, and bodies must be JSON or multipart, never simple forms.)
 */
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    // Browsers always send Origin on POST/DELETE fetches. Allow only when
    // Sec-Fetch-Site confirms a same-origin request.
    return request.headers.get("sec-fetch-site") === "same-origin";
  }
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type Guard =
  | { ok: true; session: AdminSession; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

/** Server-side authorisation for admin API routes. */
export async function requireAdmin(
  request: NextRequest,
  permission: Permission,
  options: { mutating?: boolean } = {},
): Promise<Guard> {
  if (options.mutating && !isSameOrigin(request)) {
    return { ok: false, response: jsonError(403, "طلب غير مسموح من مصدر خارجي") };
  }
  const session = await getAdminSession();
  if (!session) {
    return { ok: false, response: jsonError(401, "يجب تسجيل الدخول كمدير") };
  }
  if (!can(session, permission)) {
    return { ok: false, response: jsonError(403, "ليست لديك صلاحية لهذه العملية") };
  }
  return { ok: true, session, supabase: await createSessionClient() };
}

/** First hop of X-Forwarded-For (set by Vercel), hashed so raw IPs are never stored. */
export function clientIpHash(request: NextRequest): string {
  const ip =
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const salt = process.env.IP_HASH_SALT || "asmaa-model-library";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

/** Translates database errors into safe, user-facing Arabic messages. */
export function describeDbError(error: { code?: string; message?: string } | null): string {
  switch (error?.code) {
    case "23505":
      return "القيمة مستخدمة بالفعل (الرابط المختصر أو رمز المنتج مكرر)";
    case "23503":
      return "لا يمكن تنفيذ العملية لارتباطها ببيانات أخرى";
    case "23514":
      return "بعض القيم غير صالحة، يرجى مراجعة الحقول";
    case "42501":
      return "ليست لديك صلاحية لهذه العملية";
    case "PGRST116":
      return "العنصر غير موجود";
    default:
      return "تعذر تنفيذ العملية، حاول مرة أخرى";
  }
}

export async function readJson(request: NextRequest): Promise<unknown> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("application/json")) {
    throw new Error("unsupported_content_type");
  }
  const text = await request.text();
  if (text.length > 200_000) throw new Error("payload_too_large");
  return JSON.parse(text);
}
