import { NextResponse } from "next/server";

import { safeInternalPath } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";

/** OAuth (PKCE) callback: exchange the code for a session, then return home. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const dest = safeInternalPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
