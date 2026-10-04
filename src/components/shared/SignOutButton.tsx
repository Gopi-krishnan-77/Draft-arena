"use client";

import { useFormStatus } from "react-dom";
import { Loader2, LogOut } from "lucide-react";

/** Icon submit button for the sign-out form; spins while signing out. */
export function SignOutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      aria-label="Sign out"
      disabled={pending}
      className="inline-flex size-9 items-center justify-center rounded-full border-2 border-ink bg-surface text-on-surface-variant transition-transform hover:text-primary active:translate-y-0.5 disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
    </button>
  );
}
