import { NextResponse, type NextRequest } from "next/server";
import { contactMessageSchema, fieldErrors } from "@/lib/validations";
import { clientIpHash, isSameOrigin, jsonError, readJson } from "@/lib/api/http";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

const SUCCESS = "تم إرسال رسالتك بنجاح إلى مكتبة أسماء النموذجية. سنتواصل معك في أقرب وقت.";

/** Messages are private: there is no public read endpoint. */
export function GET() {
  return jsonError(405, "Method not allowed");
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return jsonError(403, "طلب غير مسموح");

  let body: unknown;
  try {
    body = await readJson(request);
  } catch {
    return jsonError(400, "طلب غير صالح");
  }

  const parsed = contactMessageSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(422, "يرجى التأكد من صحة البيانات المدخلة", {
      fieldErrors: fieldErrors(parsed.error),
    });
  }

  // Spam traps: a filled honeypot or an instant submit gets a fake success.
  const { website_honeypot, elapsed_ms } = parsed.data;
  if ((website_honeypot && website_honeypot.trim() !== "") || (elapsed_ms !== undefined && elapsed_ms < 2500)) {
    return NextResponse.json({ ok: true, message: SUCCESS }, { status: 201 });
  }

  if (!isSupabaseConfigured()) {
    return jsonError(503, "خدمة الرسائل غير متاحة حالياً. تواصل معنا عبر واتساب.");
  }

  // The only write path for visitors: a database function that validates
  // every field and enforces per-client, duplicate and global rate limits.
  const { error } = await createPublicClient().rpc("submit_contact_message", {
    p_name: parsed.data.name,
    p_phone: parsed.data.phone,
    p_email: parsed.data.email,
    p_message: parsed.data.message,
    p_ip_hash: clientIpHash(request),
  });

  if (error) {
    if (error.message.includes("duplicate")) {
      return jsonError(409, "تم إرسال هذه الرسالة بالفعل. شكراً لتواصلك مع مكتبة أسماء النموذجية.");
    }
    if (error.message.includes("rate_limited")) {
      return jsonError(429, "تم تجاوز الحد المسموح لإرسال الرسائل. يرجى المحاولة لاحقاً أو التواصل عبر واتساب.");
    }
    if (error.code === "23514") {
      return jsonError(422, "يرجى التأكد من صحة البيانات المدخلة");
    }
    console.error("[contact] insert failed:", error.code, error.message);
    return jsonError(500, "تعذر إرسال الرسالة حالياً. حاول مرة أخرى أو تواصل عبر واتساب.");
  }

  return NextResponse.json({ ok: true, message: SUCCESS }, { status: 201 });
}
