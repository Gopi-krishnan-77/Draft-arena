import { JerseyBadge, ROLE_TONE } from "@/components/shared/JerseyBadge";
import { cn } from "@/lib/utils";
import type { PickRecord } from "@/features/draft-room/useDraft";
import { teamStyle } from "@/features/draft-room/team-colors";

/** Chronological record of every pick, newest first. */
export function DraftHistory({ history }: { history: PickRecord[] }) {
  return (
    <section className="rounded-xl border-2 border-ink bg-surface p-sm shadow-hard">
      <h3 className="mb-sm font-display text-headline-md uppercase text-on-surface">Draft History</h3>
      {history.length === 0 ? (
        <p className="font-sans text-sm text-on-surface-variant">
          No picks yet — the board is wide open.
        </p>
      ) : (
        <ol className="space-y-2">
          {[...history].reverse().map((rec) => (
            <li
              key={rec.pickNumber}
              className={cn(
                "flex items-center gap-xs rounded-md border-2 border-l-[6px] border-outline-variant bg-surface-container-low px-xs py-2",
                teamStyle(rec.position).borderLeft
              )}
            >
              <span className="w-7 shrink-0 text-center font-stats-num text-stats-num text-on-surface">
                {rec.pickNumber}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-headline-md leading-none text-on-surface">
                  {rec.player.name}
                </p>
                <p className="truncate font-sans text-xs text-on-surface-variant">
                  R{rec.round} ·{" "}
                  <span className={cn("font-bold", teamStyle(rec.position).text)}>{rec.managerName}</span>
                </p>
              </div>
              <JerseyBadge tone={ROLE_TONE[rec.player.role]}>{rec.player.role}</JerseyBadge>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
