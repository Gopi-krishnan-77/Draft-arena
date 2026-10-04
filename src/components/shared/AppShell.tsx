import { Suspense } from "react";

import { NavigationProgress } from "@/components/shared/NavigationProgress";
import { TopAppBar } from "@/components/shared/TopAppBar";
import { BottomNav } from "@/components/shared/BottomNav";

/** Global chrome: fixed header, scrollable content well, mobile bottom nav. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-background">
      {/* useSearchParams needs a Suspense boundary to keep pages streamable */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>
      <TopAppBar />
      <main className="mx-auto w-full max-w-7xl px-margin-mobile pb-28 pt-20 md:px-margin-desktop md:pb-xl">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
