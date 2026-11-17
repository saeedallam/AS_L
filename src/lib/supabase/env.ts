import { z } from "zod";

/**
 * Environment validation. Only public (browser-safe) values are needed:
 * the app never uses the Supabase service-role key. Every privileged
 * operation runs as the signed-in admin and is enforced by RLS.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a URL, e.g. https://<ref>.supabase.co"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(20, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is missing"),
});

let cached: z.infer<typeof publicEnvSchema> | null = null;

function readPublicEnv() {
  if (cached) return cached;
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `- ${i.message}`).join("\n");
    throw new Error(
      `Supabase is not configured. Copy .env.example to .env.local and set:\n${issues}`,
    );
  }
  cached = parsed.data;
  return cached;
}

export const supabaseUrl = () => readPublicEnv().NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = () =>
  readPublicEnv().NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured(): boolean {
  try {
    readPublicEnv();
    return true;
  } catch {
    return false;
  }
}

/** Canonical site origin without a trailing slash. */
export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
