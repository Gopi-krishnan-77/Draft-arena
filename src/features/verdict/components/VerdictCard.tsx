import { Check, Crown, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import type { VerdictResult } from "@/features/verdict/schema";

function teamTone(position: number) {
  return position === 0
    ? { bg: "bg-primary", text: "text-on-primary", soft: "bg-primary/10" }
    : { bg: "bg-secondary-container", text: "text-on-secondary-container", soft: "bg-secondary-container/10" };
}

function TeamColumn({
  team,
  isWinner,
}: {
  team: VerdictResult["teams"][number];
  isWinner: boolean;
}) {
  const tone = teamTone(team.position);
  return (
    <div className="flex flex-col gap-sm rounded-xl border-2 border-ink bg-surface p-sm shadow-hard">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate font-display text-headline-md uppercase text-on-surface">
          {team.teamName}
        </h3>
        {isWinner && (
          <JerseyBadge tone="accent">
            <Crown className="size-3" /> Winner
          </JerseyBadge>
        )}
      </div>

      <div>
        <p className="font-label-bold text-label-bold uppercase text-tertiary">Strengths</p>
        <ul className="mt-1 space-y-1">
          {team.strengths.map((s, i) => (
            <li key={i} className="flex gap-1 font-sans text-sm text-on-surface">
              <Check className="mt-0.5 size-4 shrink-0 text-tertiary" /> {s}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <p className="font-label-bold text-label-bold uppercase text-error">Weaknesses</p>
        <ul className="mt-1 space-y-1">
          {team.weaknesses.map((w, i) => (
            <li key={i} className="flex gap-1 font-sans text-sm text-on-surface">
              <X className="mt-0.5 size-4 shrink-0 text-error" /> {w}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2">
        <div className={cn("rounded-md border-2 border-ink p-xs", tone.soft)}>
          <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">Best pick</p>
          <p className="font-display text-headline-md uppercase text-on-surface">{team.bestPick.player}</p>
          <p className="font-sans text-xs text-on-surface-variant">{team.bestPick.reason}</p>
        </div>
        <div className="rounded-md border-2 border-outline-variant bg-surface-container-low p-xs">
          <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">Worst pick</p>
          <p className="font-display text-headline-md uppercase text-on-surface">{team.worstPick.player}</p>
          <p className="font-sans text-xs text-on-surface-variant">{team.worstPick.reason}</p>
        </div>
      </div>
    </div>
  );
}

export function VerdictCard({ result }: { result: VerdictResult }) {
  const teamA = result.teams.find((t) => t.position === 0) ?? result.teams[0];
  const teamB = result.teams.find((t) => t.position === 1) ?? result.teams[1];
  const probA = result.winProbability.find((w) => w.position === 0)?.percent ?? 50;
  const probB = 100 - probA;

  return (
    <section className="space-y-md rounded-xl border-2 border-ink bg-on-background p-md shadow-hard">
      {/* headline */}
      <div className="space-y-xs text-center">
        <JerseyBadge tone="live">The Verdict</JerseyBadge>
        <p className="font-display text-headline-lg-mobile font-black uppercase italic leading-tight text-surface">
          “{result.headline}”
        </p>
      </div>

      {/* win probability bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-stats-num text-stats-num">
          <span className="text-inverse-primary">{teamA.teamName} {probA}%</span>
          <span className="text-secondary-fixed-dim">{probB}% {teamB.teamName}</span>
        </div>
        <div className="flex h-5 overflow-hidden rounded-full border-2 border-ink">
          <div className="bg-primary" style={{ width: `${probA}%` }} />
          <div className="bg-secondary-container" style={{ width: `${probB}%` }} />
        </div>
      </div>

      {/* team breakdowns */}
      <div className="grid gap-sm md:grid-cols-2">
        <TeamColumn team={teamA} isWinner={result.predictedWinnerPosition === teamA.position} />
        <TeamColumn team={teamB} isWinner={result.predictedWinnerPosition === teamB.position} />
      </div>

      <p className="text-center font-display text-label-bold uppercase tracking-widest text-surface/40">
        Draft Arena
      </p>
    </section>
  );
}
