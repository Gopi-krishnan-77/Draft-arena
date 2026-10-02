import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { DRAFT_TYPES } from "@/features/draft-room/draft-types";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

export function DraftTypeGrid() {
  return (
    <section id="draft-types" className="scroll-mt-20 space-y-md">
      <div>
        <h2 className="font-display text-headline-lg-mobile font-black uppercase italic text-on-surface md:text-headline-lg">
          Choose your battle
        </h2>
        <div className="mt-1 h-1 w-24 bg-secondary" />
      </div>

      <div className="grid gap-sm md:grid-cols-3">
        {DRAFT_TYPES.map((type) => (
          <Link
            key={type.id}
            href={`/draft/new?type=${type.id}`}
            className="group flex flex-col items-start gap-sm rounded-xl border-2 border-ink bg-surface p-md shadow-hard transition-all hover:-translate-y-1 hover:shadow-hard-lg active:translate-y-1 active:shadow-none"
          >
            <JerseyBadge tone={TONE_MAP[type.tone]}>{type.tagline}</JerseyBadge>
            <h3 className="font-display text-headline-md font-bold uppercase text-on-surface">
              {type.label}
            </h3>
            <p className="flex-1 font-sans text-body-md text-on-surface-variant">
              {type.description}
            </p>
            <span className="inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-primary">
              Start drafting{" "}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
