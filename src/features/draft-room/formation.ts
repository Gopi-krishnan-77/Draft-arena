import type { PlayerRole } from "@/types/player";

export const ROLE_ORDER: PlayerRole[] = ["GK", "DEF", "MID", "FWD"];

/**
 * Squad composition rules for an 11-player XI. Prevents lopsided teams
 * (e.g. 11 forwards) while still allowing many real formations
 * (4-3-3, 4-4-2, 3-5-2, 5-3-2, 4-5-1, …). Min sum = 7, max sum = 14, roster = 11.
 */
export const POSITION_LIMITS: Record<PlayerRole, { min: number; max: number }> = {
  GK: { min: 1, max: 1 },
  DEF: { min: 3, max: 5 },
  MID: { min: 2, max: 5 },
  FWD: { min: 1, max: 3 },
};

export function countByRole(picks: { role: PlayerRole }[]): Record<PlayerRole, number> {
  const counts: Record<PlayerRole, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of picks) counts[p.role] += 1;
  return counts;
}

/**
 * Which positions can be drafted right now without (a) exceeding a max or
 * (b) making it impossible to still meet every minimum with the picks left.
 */
export function allowedRoles(picks: { role: PlayerRole }[], rosterSize: number): Set<PlayerRole> {
  const counts = countByRole(picks);
  const remaining = rosterSize - picks.length;
  const allowed = new Set<PlayerRole>();
  if (remaining <= 0) return allowed;

  for (const role of ROLE_ORDER) {
    if (counts[role] >= POSITION_LIMITS[role].max) continue;
    // After taking this role, can the remaining picks still cover all minimums?
    let unmet = 0;
    for (const r of ROLE_ORDER) {
      const after = counts[r] + (r === role ? 1 : 0);
      unmet += Math.max(0, POSITION_LIMITS[r].min - after);
    }
    if (unmet <= remaining - 1) allowed.add(role);
  }
  return allowed;
}

export interface FormationSlot {
  role: PlayerRole;
  count: number;
  min: number;
  max: number;
  atMax: boolean;
  /** Minimum not yet reached. */
  needed: boolean;
}

export function formationSlots(picks: { role: PlayerRole }[]): FormationSlot[] {
  const counts = countByRole(picks);
  return ROLE_ORDER.map((role) => ({
    role,
    count: counts[role],
    min: POSITION_LIMITS[role].min,
    max: POSITION_LIMITS[role].max,
    atMax: counts[role] >= POSITION_LIMITS[role].max,
    needed: counts[role] < POSITION_LIMITS[role].min,
  }));
}
