import Link from "next/link";
import { Sparkles, RotateCcw } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import type { DraftTypeMeta } from "@/features/draft-room/draft-types";
import type { TeamState } from "@/features/draft-room/useDraft";

interface DraftCompleteProps {
  teams: [TeamState, TeamState];
  meta: DraftTypeMeta;
  /** Hotseat only — replay the same matchup locally. Omitted for persisted rooms. */
  onReset?: () => void;
  newDraftHref?: string;
  /** Online: link to the verdict page. */
  verdictHref?: string;
  /** Hotseat: reveal the inline verdict. */
  onGetVerdict?: () => void;
}

/** Shown when all 22 picks are in. The AI verdict is the payoff. */
export function DraftComplete({
  teams,
  meta,
  onReset,
  newDraftHref = "/draft/new",
  verdictHref,
  onGetVerdict,
}: DraftCompleteProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border-2 border-ink bg-on-background p-md text-surface shadow-hard md:p-lg">
      <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-44 rounded-full bg-tertiary-fixed/30 blur-2xl" />
      <div className="relative space-y-md">
        <div className="space-y-xs">
          <JerseyBadge tone="accent">
            <Sparkles className="size-3" /> Draft Complete
          </JerseyBadge>
          <h2 className="font-display-xl text-headline-lg-mobile font-black uppercase leading-none md:text-display-xl">
            Both XIs are set
          </h2>
          <p className="font-sans text-sm text-surface/70">
            {meta.label} · {teams[0].name} vs {teams[1].name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-sm">
          {teams.map((team) => {
            const avg = team.picks.length
              ? Math.round(team.picks.reduce((s, p) => s + p.rating, 0) / team.picks.length)
              : 0;
            return (
              <div key={team.position} className="rounded-md border-2 border-surface/20 bg-surface/5 p-sm">
                <p className="truncate font-display text-headline-md uppercase">{team.name}</p>
                <p className="font-sans text-xs uppercase text-surface/60">Squad rating</p>
                <p className="font-stats-num text-display-xl leading-none text-tertiary-fixed">{avg}</p>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-sm sm:flex-row sm:items-center">
          {verdictHref ? (
            <HardButton asChild intent="accent">
              <Link href={verdictHref}>
                <Sparkles /> Get AI Verdict
              </Link>
            </HardButton>
          ) : onGetVerdict ? (
            <HardButton intent="accent" onClick={onGetVerdict}>
              <Sparkles /> Get AI Verdict
            </HardButton>
          ) : null}
          <HardButton asChild intent="outline">
            <Link href={newDraftHref}>
              <RotateCcw /> New Draft
            </Link>
          </HardButton>
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="font-label-bold text-label-bold uppercase text-surface/70 underline-offset-4 hover:underline"
            >
              Redraft these teams
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
