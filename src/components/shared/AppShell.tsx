import { Suspense } from "react";

import { NavigationProgress } from "@/components/shared/NavigationProgress";
import { TopAppBar } from "@/components/shared/TopAppBar";
import { BottomNav } from "@/components/shared/BottomNav";
import { SiteFooter } from "@/components/shared/SiteFooter";

/** Global chrome: fixed header, scrollable content well, footer, mobile bottom nav. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-background">
      {/* useSearchParams needs a Suspense boundary to keep pages streamable */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <TopAppBar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-margin-mobile pb-xl pt-20 md:px-margin-desktop">
        {children}
      </main>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}
