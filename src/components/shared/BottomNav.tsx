"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Zap, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Extra path prefixes that should light this tab up. */
  match?: string[];
}

// Mirrors the header: "+ Create" = online draft; Quick Play = one-device hotseat.
const ITEMS: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/draft/new", label: "New Draft", icon: Users, match: ["/draft/join"] },
  { href: "/draft/create", label: "Quick Play", icon: Zap, match: ["/draft/play"] },
];

/** Mobile-first bottom navigation. Hidden on desktop (nav lives in the header). */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-20 items-stretch justify-around border-t-2 border-ink bg-surface pb-safe shadow-hard-top md:hidden">
      {ITEMS.map(({ href, label, icon: Icon, match = [] }) => {
        const active =
          href === "/"
            ? pathname === "/"
            : [href, ...match].some((prefix) => pathname.startsWith(prefix));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 transition-transform active:scale-95",
              active ? "text-secondary" : "text-on-surface-variant hover:text-primary"
            )}
          >
            {/* active indicator — a bar, not an icon fill (fills erase line icons) */}
            <span
              className={cn(
                "absolute inset-x-6 top-0 h-1 rounded-b-full transition-colors",
                active ? "bg-secondary" : "bg-transparent"
              )}
            />
            <Icon className="size-6" strokeWidth={active ? 2.75 : 2} />
            <span className="font-label-bold text-label-bold uppercase">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
