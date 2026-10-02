import { cn } from "@/lib/utils";
import { teamStyle } from "@/features/draft-room/team-colors";

interface TurnBarProps {
  /** Show only once the big on-the-clock banner has scrolled out of view. */
  visible: boolean;
  teamName: string;
  position: number;
  round: number;
  pickNumber: number;
  totalPicks: number;
  /** Seconds left on the pick clock (online drafts). */
  secondsLeft?: number | null;
  /** Short status, e.g. "Your pick" / "Waiting". */
  note?: string;
}

/**
 * Compact "who's on the clock" bar pinned under the header while scrolling the
 * player pool — so the picker never has to scroll back up to check.
 */
export function TurnBar({
  visible,
  teamName,
  position,
  round,
  pickNumber,
  totalPicks,
  secondsLeft,
  note,
}: TurnBarProps) {
  const team = teamStyle(position);
  const urgent = secondsLeft != null && secondsLeft <= 10;

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        "fixed inset-x-0 top-16 z-40 border-b-2 border-ink bg-on-background transition-all duration-200",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-2 opacity-0"
      )}
    >
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-xs px-margin-mobile md:px-margin-desktop">
        <span className={cn("inline-flex min-w-0 items-center gap-1.5 rounded-sm border-2 border-ink px-xs py-0.5", team.solid)}>
          <span className="size-2 shrink-0 animate-pulse rounded-full bg-current" />
          <span className="truncate font-display text-label-bold uppercase tracking-wide">
            {teamName}
          </span>
        </span>
        <span className="shrink-0 font-label-bold text-label-bold uppercase text-surface/80">
          on the clock
        </span>

        <span className="ml-auto flex shrink-0 items-center gap-sm">
          {note && (
            <span className="hidden font-label-bold text-label-bold uppercase text-tertiary-fixed sm:inline">
              {note}
            </span>
          )}
          {secondsLeft != null && (
            <span
              className={cn(
                "font-stats-num text-stats-num tabular-nums",
                urgent ? "text-secondary-fixed-dim" : "text-surface"
              )}
            >
              {Math.max(0, secondsLeft)}s
            </span>
          )}
          <span className="font-stats-num text-label-bold text-surface/60">
            R{round} · {pickNumber}/{totalPicks}
          </span>
        </span>
      </div>
    </div>
  );
}
