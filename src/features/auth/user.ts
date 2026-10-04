import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Current user, or null. Returns null (no cookie read) until Supabase is configured.
 * Memoized per request: the header, page and widgets all ask, but getUser() is a
 * network round trip to Supabase Auth, so only the first caller pays for it.
 */
export const getUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Require a signed-in user or redirect to login (preserving where to return). */
export async function requireUser(next?: string): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}

/** A friendly name from Google metadata, or a guest fallback. */
export function displayNameFor(user: User): string {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  return (
    meta.full_name ||
    meta.name ||
    (user.is_anonymous ? "Guest" : user.email?.split("@")[0]) ||
    "Player"
  );
}
