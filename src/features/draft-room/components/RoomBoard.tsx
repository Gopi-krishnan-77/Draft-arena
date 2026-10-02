"use client";

import { useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tab = "main" | "squads" | "history";

interface RoomBoardProps {
  /** Player pool while drafting, or the pitch when complete. */
  main: ReactNode;
  squads: ReactNode;
  history: ReactNode;
  mainLabel: string;
  historyCount: number;
}

/**
 * Draft-room layout. Desktop: main column + sidebar side by side. Mobile: a
 * tab switcher, so the squads and history aren't buried under the whole pool.
 */
export function RoomBoard({ main, squads, history, mainLabel, historyCount }: RoomBoardProps) {
  const [tab, setTab] = useState<Tab>("main");

  const tabs: { id: Tab; label: string }[] = [
    { id: "main", label: mainLabel },
    { id: "squads", label: "Squads" },
    { id: "history", label: historyCount ? `History · ${historyCount}` : "History" },
  ];

  return (
    <div className="space-y-sm">
      <div role="tablist" className="grid grid-cols-3 gap-1 rounded-full border-2 border-ink bg-surface-container p-1 lg:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "truncate rounded-full px-xs py-1.5 font-display text-label-bold uppercase tracking-wide transition-colors",
              tab === t.id ? "bg-on-background text-surface" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="grid gap-md lg:grid-cols-[1fr_minmax(300px,360px)]">
        <div className={cn("min-w-0 space-y-sm", tab !== "main" && "hidden lg:block")}>{main}</div>
        <aside className="min-w-0 space-y-md">
          <div className={cn(tab !== "squads" && "hidden lg:block")}>{squads}</div>
          <div className={cn(tab !== "history" && "hidden lg:block")}>{history}</div>
        </aside>
      </div>
    </div>
  );
}
