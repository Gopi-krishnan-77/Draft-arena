import { cn } from "@/lib/utils";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import type { PickSlot } from "@/features/draft-room/snake";
import { teamStyle } from "@/features/draft-room/team-colors";

interface CurrentPickBannerProps {
  slot: PickSlot;
  currentTeamName: string;
  totalPicks: number;
  /** Optional "On the Clock" countdown ring (online drafts). */
  timer?: React.ReactNode;
}

/** Broadcast "score bug" — whose turn (in their team colour), which round, the running pick count. */
export function CurrentPickBanner({ slot, currentTeamName, totalPicks, timer }: CurrentPickBannerProps) {
  const team = teamStyle(slot.position);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-l-[10px] border-ink bg-on-background p-md shadow-hard",
        team.borderLeft
      )}
    >
      {/* stadium-light glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 animate-pulse-ring rounded-full bg-secondary/40 blur-2xl" />
      <div className="relative flex items-center justify-between gap-sm">
        <div className="min-w-0">
          <JerseyBadge tone="live">
            <span className="mr-1 inline-block size-2 animate-pulse rounded-full bg-on-secondary" />
            On the Clock
          </JerseyBadge>
          <p className="mt-xs">
            <span
              className={cn(
                "inline-block max-w-full truncate rounded-sm border-2 border-ink px-xs font-display text-headline-lg-mobile font-black uppercase leading-tight md:text-headline-lg",
                team.solid
              )}
            >
              {currentTeamName}
            </span>
          </p>
          <p className="mt-1 font-sans text-sm text-surface/70">
            Manager {slot.position + 1} is picking now
          </p>
        </div>
        {timer}
        <div className="shrink-0 text-right">
          <p className="font-label-bold text-label-bold uppercase text-surface/60">Round</p>
          <p className="font-stats-num text-[56px] leading-none text-tertiary-fixed md:text-display-xl">
            {slot.round}
          </p>
          <p className="font-label-bold text-label-bold uppercase text-surface/60">
            Pick {slot.pickNumber}/{totalPicks}
          </p>
        </div>
      </div>
    </div>
  );
}
