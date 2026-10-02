import { redirect } from "next/navigation";

import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { isSupabaseConfigured } from "@/lib/env";
import { safeInternalPath } from "@/lib/utils";
import { getUser } from "@/features/auth/user";
import { signInAsGuest, signInWithGoogle } from "@/features/auth/actions";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.5 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.2-.4-4.7H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16.8z" />
      <path fill="#FBBC05" d="M10.4 28.3c-.5-1.4-.8-3-.8-4.3s.3-2.9.8-4.3l-7.8-6.1C1 16.8 0 20.3 0 24s1 7.2 2.6 10.4l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.1-5.5c-2 1.4-4.6 2.2-7.9 2.2-6.3 0-11.7-3.7-13.6-9.8l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  // Already signed in? Skip the page.
  const dest = safeInternalPath(next);
  const user = await getUser();
  if (user) redirect(dest);
  const configured = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-md space-y-lg py-xl">
      <div className="space-y-xs text-center">
        <JerseyBadge tone="live">Draft Arena</JerseyBadge>
        <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface">
          Get in the arena
        </h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Sign in to create draft rooms and challenge a friend.
        </p>
      </div>

      {error && (
        <p className="rounded-md border-2 border-error bg-error-container px-sm py-xs font-sans text-sm text-on-error-container">
          Something went wrong signing in. Please try again.
        </p>
      )}

      <div className="space-y-sm rounded-xl border-2 border-ink bg-surface p-md shadow-hard">
        {configured ? (
          <>
            <form action={signInWithGoogle}>
              <input type="hidden" name="next" value={dest} />
              <HardButton type="submit" intent="outline" className="w-full">
                <GoogleMark /> Continue with Google
              </HardButton>
            </form>

            <div className="flex items-center gap-xs">
              <span className="h-px flex-1 bg-outline-variant" />
              <span className="font-label-bold text-label-bold uppercase text-on-surface-variant">
                or
              </span>
              <span className="h-px flex-1 bg-outline-variant" />
            </div>

            <form action={signInAsGuest}>
              <input type="hidden" name="next" value={dest} />
              <HardButton type="submit" intent="primary" className="w-full">
                Play as Guest
              </HardButton>
            </form>

            <p className="text-center font-sans text-xs text-on-surface-variant">
              Guest play is instant — no email needed. Guest drafts stay on this browser; use
              Google to keep them across devices.
            </p>
          </>
        ) : (
          <div className="space-y-sm">
            <HardButton intent="outline" disabled className="w-full">
              <GoogleMark /> Continue with Google
            </HardButton>
            <HardButton intent="primary" disabled className="w-full">
              Play as Guest
            </HardButton>
            <p className="rounded-md border-2 border-outline-variant bg-surface-container-low px-sm py-xs text-center font-sans text-xs text-on-surface-variant">
              Sign-in activates once Supabase is connected — add your keys to{" "}
              <code className="font-mono">.env.local</code> (see <code>SETUP.md</code>).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
