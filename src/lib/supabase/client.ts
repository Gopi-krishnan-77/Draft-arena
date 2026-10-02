import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";
import { requireSupabaseEnv } from "@/lib/env";

/** Browser Supabase client (anon key, RLS-gated). For use in client components. */
export function createClient() {
  const { url, anonKey } = requireSupabaseEnv();
  return createBrowserClient<Database>(url, anonKey);
}
