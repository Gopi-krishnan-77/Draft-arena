import Link from "next/link";
import { UserRound } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";
import { SignOutButton } from "@/components/shared/SignOutButton";
import { getUser, displayNameFor } from "@/features/auth/user";
import { signOut } from "@/features/auth/actions";

/** Header auth control: a name chip + sign-out, or a sign-in link. */
export async function UserMenu() {
  const user = await getUser();

  if (!user) {
    return (
      <HardButton asChild intent="outline" size="sm">
        <Link href="/login">Sign in</Link>
      </HardButton>
    );
  }

  return (
    <div className="flex items-center gap-xs">
      <span className="hidden items-center gap-1 rounded-full border-2 border-ink bg-surface-container px-xs py-1 sm:inline-flex">
        <UserRound className="size-4 text-on-surface-variant" />
        <span className="max-w-[8rem] truncate font-label-bold text-label-bold uppercase text-on-surface">
          {displayNameFor(user)}
        </span>
      </span>
      <form action={signOut}>
        <SignOutButton />
      </form>
    </div>
  );
}
