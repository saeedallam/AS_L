import crypto from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

/**
 * Daily keep-alive + health check, called by the Vercel Cron Job in
 * vercel.json. It reads one public row so the Supabase project always has
 * database activity (Free-plan projects are paused after ~7 days without it).
 *
 * Vercel sends `Authorization: Bearer <CRON_SECRET>` automatically when the
 * CRON_SECRET environment variable is set. Without a valid secret the route
 * refuses the request, so it cannot be abused from outside.
 */
function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, database: "not_configured" }, { status: 503 });
  }

  const started = Date.now();
  const { error } = await createPublicClient()
    .from("site_settings")
    .select("setting_key")
    .limit(1);

  if (error) {
    console.error("[health] database check failed:", error.message);
    return NextResponse.json({ ok: false, database: "down" }, { status: 503 });
  }

  return NextResponse.json(
    { ok: true, database: "up", ms: Date.now() - started, at: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
