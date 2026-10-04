"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top progress bar for in-app link navigation. Server-rendered pages need
 * a round trip (auth + Supabase queries) before they paint, so without this a
 * tap looks like nothing happened. Starts on any same-origin <a> click and
 * clears once the URL actually changes.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);

  // URL changed → navigation landed.
  useEffect(() => {
    setActive(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || !anchor.href || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setActive(true);
    }
    // Capture phase: next/link calls preventDefault() in its own handler, which
    // would otherwise run first and hide the click from a bubbling listener.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Safety net: never leave the bar stuck (e.g. navigation failed).
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 15_000);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;
  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className="fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden bg-primary/20"
    >
      <div className="h-full w-1/3 animate-nav-progress bg-primary" />
    </div>
  );
}
