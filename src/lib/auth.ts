import "server-only";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdminRole } from "@/types/database";
import { isSupabaseConfigured } from "./supabase/env";
import { createSessionClient } from "./supabase/server";

/**
 * Admin authentication = Supabase Auth session (HTTP-only cookies managed by
 * @supabase/ssr) + an authorised role in public.profiles.
 *
 * The role is read from the database on every request, so demoting a user
 * takes effect immediately. RLS enforces the same rules again in Postgres.
 */
export interface AdminSession {
  userId: string;
  email: string;
  role: Exclude<AdminRole, "viewer">;
}

export type Permission = "catalog" | "messages" | "settings";

const PERMISSIONS: Record<AdminSession["role"], readonly Permission[]> = {
  admin: ["catalog", "messages", "settings"],
  editor: ["catalog"],
};

export function can(session: AdminSession, permission: Permission): boolean {
  return PERMISSIONS[session.role].includes(permission);
}

async function readSession(
  supabase: SupabaseClient,
): Promise<AdminSession | null> {
  // getUser() validates the JWT with Supabase Auth (never trust getSession() server-side).
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (error || !profile) return null;
  if (profile.role !== "admin" && profile.role !== "editor") return null;

  return {
    userId: userData.user.id,
    email: userData.user.email ?? profile.email,
    role: profile.role,
  };
}

/** The current admin session, or null. Deduplicated per request. */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createSessionClient();
    return await readSession(supabase);
  } catch {
    return null;
  }
});

/**
 * Signs in with email + password and verifies the account is authorised.
 * Unauthorised accounts are signed straight back out.
 */
export async function signInAdmin(
  email: string,
  password: string,
): Promise<{ ok: true; session: AdminSession } | { ok: false; reason: "invalid" | "forbidden" | "unavailable" }> {
  if (!isSupabaseConfigured()) return { ok: false, reason: "unavailable" };

  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { ok: false, reason: error.status === 429 ? "unavailable" : "invalid" };
  }

  const session = await readSession(supabase);
  if (!session) {
    await supabase.auth.signOut();
    return { ok: false, reason: "forbidden" };
  }
  return { ok: true, session };
}

export async function signOutAdmin(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
}
