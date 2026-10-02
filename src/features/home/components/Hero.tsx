import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-xl border-2 border-ink bg-on-background p-md shadow-hard-primary md:p-xl">
      <div className="stadium-lines pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary-container/40 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-48 w-48 rounded-full bg-secondary/30 blur-3xl" />

      <div className="relative max-w-2xl space-y-md">
        <JerseyBadge tone="live">Football · 1v1</JerseyBadge>
        <h1 className="font-display-xl text-[44px] font-black uppercase italic leading-[0.95] text-surface md:text-display-xl">
          Pick your XI.
          <br />
          <span className="text-tertiary-fixed">Settle the debate.</span>
        </h1>
        <p className="max-w-lg font-sans text-body-lg text-surface/80">
          Go head-to-head in a snake draft, build your all-time eleven, and let the AI deliver a
          brutal verdict on who actually wins.
        </p>
        <div className="flex flex-col gap-sm sm:flex-row">
          <HardButton asChild intent="primary" size="lg">
            <Link href="/draft/new">
              Create Draft <ArrowRight />
            </Link>
          </HardButton>
          <HardButton asChild intent="outline" size="lg">
            <Link href="/draft/create">Quick Play · 1 device</Link>
          </HardButton>
        </div>
      </div>
    </section>
  );
}
