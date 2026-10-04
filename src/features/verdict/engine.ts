import type { TeamInput } from "@/features/verdict/types";

/**
 * Deterministic match engine: decides who wins and by how much from the two
 * squads alone. The AI only writes the analysis around this result, so the
 * same draft always gets the same winner and odds — for both managers and in
 * every personality mode.
 */

const LINE_WEIGHTS = { GK: 0.1, DEF: 0.3, MID: 0.3, FWD: 0.3 } as const;
type Line = keyof typeof LINE_WEIGHTS;
const LINES = Object.keys(LINE_WEIGHTS) as Line[];

/** Rating points of strength difference per e-fold in odds: 1pt ≈ 58%, 3pt ≈ 73%. */
const SPREAD = 3;
/** Football is never a sure thing — cap how lopsided the odds can get. */
const MIN_PERCENT = 15;
const MAX_PERCENT = 85;

export interface TeamRating {
  position: number;
  lines: Record<Line, number>;
  /** Weighted line average: keeper 10%, each outfield line 30%. */
  strength: number;
}

export interface MatchResult {
  ratings: [TeamRating, TeamRating];
  winnerPosition: 0 | 1;
  /** Win chance for position 0 and position 1, integers summing to 100. */
  percents: [number, number];
}

const avg = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;

export function rateTeam(team: TeamInput): TeamRating {
  const overall = team.players.length ? avg(team.players.map((p) => p.rating)) : 0;
  const lines = Object.fromEntries(
    LINES.map((line) => {
      const ratings = team.players.filter((p) => p.role === line).map((p) => p.rating);
      // An empty line (shouldn't happen in a legal XI) falls back to the squad average.
      return [line, ratings.length ? avg(ratings) : overall];
    })
  ) as Record<Line, number>;
  const strength = LINES.reduce((s, line) => s + lines[line] * LINE_WEIGHTS[line], 0);
  return { position: team.position, lines, strength };
}

export function simulateMatch(teams: [TeamInput, TeamInput]): MatchResult {
  const a = rateTeam(teams[0]);
  const b = rateTeam(teams[1]);
  const diff = a.strength - b.strength;

  let pa = Math.round(100 / (1 + Math.exp(-diff / SPREAD)));
  pa = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, pa));
  // No draws in a verdict: a dead heat goes 51–49 to the (fractionally) stronger side.
  if (pa === 50) pa = diff >= 0 ? 51 : 49;

  return {
    ratings: [a, b],
    winnerPosition: pa > 50 ? 0 : 1,
    percents: [pa, 100 - pa],
  };
}
