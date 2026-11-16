import { createClient } from "@supabase/supabase-js";
import { supabasePublishableKey, supabaseUrl } from "./env";

/**
 * Cookie-less client for public, cacheable reads (catalog, settings).
 * It always acts as an anonymous visitor, so RLS returns published content only.
 */
export function createPublicClient() {
  return createClient(supabaseUrl(), supabasePublishableKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
