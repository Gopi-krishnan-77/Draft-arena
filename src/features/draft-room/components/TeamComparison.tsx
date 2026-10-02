import { cn } from "@/lib/utils";
import { JerseyBadge, ROLE_TONE } from "@/components/shared/JerseyBadge";
import type { PlayerRole } from "@/types/player";
import { ROSTER_SIZE } from "@/features/draft-room/draft-types";
import type { TeamState } from "@/features/draft-room/useDraft";
import { shortName, teamStyle } from "@/features/draft-room/team-colors";

const ROLE_ORDER: PlayerRole[] = ["GK", "DEF", "MID", "FWD"];

function teamStats(team: TeamState) {
  const count = team.picks.length;
  const avg = count ? Math.round(team.picks.reduce((s, p) => s + p.rating, 0) / count) : 0;
  const byRole: Record<PlayerRole, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of team.picks) byRole[p.role] += 1;
  return { count, avg, byRole };
}

function TeamColumn({ team, active }: { team: TeamState; active: boolean }) {
  const { count, avg, byRole } = teamStats(team);
  const style = teamStyle(team.position);
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-xl border-2 border-t-[6px] border-ink bg-surface p-sm shadow-hard transition-shadow",
        style.borderTop,
        active && "ring-4 ring-tertiary-fixed"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <h4 className={cn("min-w-0 truncate font-display text-headline-md uppercase", style.text)}>
          {team.name}
        </h4>
        {active && <JerseyBadge tone="live">Picking</JerseyBadge>}
      </div>

      <div className="mt-xs flex items-center justify-between rounded-md bg-surface-container-low px-xs py-2">
        <div>
          <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">Avg</p>
          <p className="font-stats-num text-stats-num text-primary">{avg || "—"}</p>
        </div>
        <div className="text-right">
          <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">Squad</p>
          <p className="font-stats-num text-stats-num text-on-surface">
            {count}/{ROSTER_SIZE}
          </p>
        </div>
      </div>

      <div className="mt-xs flex flex-wrap gap-1">
        {ROLE_ORDER.map((role) => (
          <JerseyBadge key={role} tone={ROLE_TONE[role]} className={cn(byRole[role] === 0 && "opacity-40")}>
            {role} {byRole[role]}
          </JerseyBadge>
        ))}
      </div>

      <ol className="mt-sm space-y-1">
        {team.picks.length === 0 ? (
          <li className="font-sans text-xs text-on-surface-variant">No picks yet.</li>
        ) : (
          team.picks.map((p) => (
            <li key={p.id} className="flex items-center gap-2 text-sm">
              <span className="w-6 shrink-0 text-center font-stats-num text-on-surface-variant">
                {p.rating}
              </span>
              <span
                className="min-w-0 flex-1 truncate font-sans text-on-surface"
                title={`${p.name} · ${p.role}`}
              >
                {shortName(p.name)}
              </span>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}

interface TeamComparisonProps {
  teams: [TeamState, TeamState];
  activePosition: number | null;
}

/** Side-by-side squad comparison — the heart of the "who's winning" tension. */
export function TeamComparison({ teams, activePosition }: TeamComparisonProps) {
  return (
    <section className="grid grid-cols-2 gap-sm">
      {teams.map((team) => (
        <TeamColumn key={team.position} team={team} active={team.position === activePosition} />
      ))}
    </section>
  );
}
