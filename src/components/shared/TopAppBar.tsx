import Link from "next/link";

import { HardButton } from "@/components/shared/HardButton";
import { UserMenu } from "@/components/shared/UserMenu";

/** Fixed broadcast-style header: brand wordmark, create action, auth control. */
export function TopAppBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b-2 border-ink bg-surface">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-margin-mobile md:px-margin-desktop">
        <Link
          href="/"
          className="font-display text-headline-md font-black italic uppercase tracking-tighter text-primary"
        >
          Draft Arena
        </Link>

        <nav className="flex items-center gap-sm">
          <Link
            href="/"
            className="hidden font-label-bold text-label-bold uppercase tracking-wide text-on-surface-variant hover:text-primary md:inline"
          >
            Home
          </Link>
          <HardButton asChild intent="primary" size="sm">
            <Link href="/draft/new">+ Create</Link>
          </HardButton>
          <UserMenu />
        </nav>
      </div>
    </header>
  );
}
