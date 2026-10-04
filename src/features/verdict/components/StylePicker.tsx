import { BarChart3, Flame, Landmark, Mic, Sparkles, type LucideIcon } from "lucide-react";

import { VERDICT_MODES, type VerdictMode } from "@/features/verdict/schema";

const ICONS: Record<VerdictMode, LucideIcon> = {
  ANALYST: BarChart3,
  COMMENTATOR: Mic,
  HISTORIAN: Landmark,
  TRASH_TALK: Flame,
};

/** First step of the verdict: choose who delivers it. */
export function StylePicker({ onPick }: { onPick: (mode: VerdictMode) => void }) {
  return (
    <section className="space-y-md rounded-xl border-2 border-ink bg-on-background p-md shadow-hard md:p-lg">
      <div className="space-y-xs text-center">
        <p className="inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-tertiary-fixed">
          <Sparkles className="size-4" /> AI Verdict
        </p>
        <h2 className="font-display-xl text-headline-lg-mobile font-black uppercase italic leading-none text-surface">
          Who should judge it?
        </h2>
        <p className="font-sans text-sm text-surface/70">
          Same result, different voice. You can switch styles after.
        </p>
      </div>

      <div className="grid gap-sm sm:grid-cols-2">
        {VERDICT_MODES.map((m) => {
          const Icon = ICONS[m.id];
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onPick(m.id)}
              className="group flex items-center gap-sm rounded-xl border-2 border-ink bg-surface p-sm text-left shadow-hard transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-md border-2 border-ink bg-primary text-on-primary transition-colors group-hover:bg-tertiary-fixed group-hover:text-on-tertiary-fixed">
                <Icon className="size-6" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-headline-md uppercase leading-none text-on-surface">
                  {m.label}
                </span>
                <span className="block font-sans text-sm text-on-surface-variant">{m.blurb}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
