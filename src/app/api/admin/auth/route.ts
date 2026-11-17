import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession, signInAdmin, signOutAdmin } from "@/lib/auth";
import { adminLoginSchema } from "@/lib/validations";
import { isSameOrigin, jsonError, readJson } from "@/lib/api/http";

export const dynamic = "force-dynamic";

/** Current session (used by the login page to skip the form when signed in). */
export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    user: { email: session.email, role: session.role },
  });
}

/** Sign in. Supabase Auth checks the password and applies its own rate limits. */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError(403, "طلب غير مسموح");

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError(400, "طلب غير صالح");
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, "يرجى إدخال بريد إلكتروني وكلمة مرور صحيحة");
  }

  const result = await signInAdmin(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    if (result.reason === "unavailable") {
      return jsonError(429, "محاولات كثيرة أو الخدمة غير متاحة. حاول بعد قليل.");
    }
    // Same message for wrong password and non-admin accounts (no account enumeration).
    return jsonError(401, "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو الحساب غير مصرح له.");
  }

  return NextResponse.json({
    ok: true,
    user: { email: result.session.email, role: result.session.role },
  });
}

/** Sign out: clears the Supabase session cookies. */
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError(403, "طلب غير مسموح");
  await signOutAdmin();
  return NextResponse.json({ ok: true });
}
