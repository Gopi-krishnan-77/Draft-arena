export type DraftType = "GOAT_XI" | "ALL_TIME_XI" | "UNDERRATED_XI";

/** V1 is fixed: exactly 2 managers, 11 picks each (a starting XI). */
export const PARTICIPANTS = 2 as const;
export const ROSTER_SIZE = 11 as const;
export const TOTAL_PICKS = PARTICIPANTS * ROSTER_SIZE; // 22

/** Seconds per pick in online drafts. Mirrors `interval '60 seconds'` in auto_pick() (migration 0005). */
export const TURN_SECONDS = 60 as const;

export interface DraftTypeMeta {
  id: DraftType;
  label: string;
  tagline: string;
  description: string;
  /** Badge tone used across the UI for this draft type. */
  tone: "primary" | "secondary" | "accent";
}

export const DRAFT_TYPES: DraftTypeMeta[] = [
  {
    id: "GOAT_XI",
    label: "GOAT XI",
    tagline: "Only legends allowed",
    description: "Draft the greatest of all time. No filler, no excuses — build a team for the ages.",
    tone: "primary",
  },
  {
    id: "ALL_TIME_XI",
    label: "All-Time XI",
    tagline: "Your dream eleven",
    description: "Pick across every era. Balance the spine, settle the bench debate, and prove your XI.",
    tone: "secondary",
  },
  {
    id: "UNDERRATED_XI",
    label: "Underrated XI",
    tagline: "Respect the slept-on",
    description: "Forget the obvious picks. Build the most criminally underrated team you can defend.",
    tone: "accent",
  },
];

export const DRAFT_TYPE_MAP: Record<DraftType, DraftTypeMeta> = Object.fromEntries(
  DRAFT_TYPES.map((t) => [t.id, t])
) as Record<DraftType, DraftTypeMeta>;

export function isDraftType(value: string): value is DraftType {
  return value in DRAFT_TYPE_MAP;
}

/**
 * Is a player draftable in this draft type?
 * ALL_TIME_XI = everyone; GOAT_XI / UNDERRATED_XI = only tagged players.
 */
export function isEligible(
  player: { categories: ("GOAT_XI" | "UNDERRATED_XI")[] },
  draftType: DraftType
): boolean {
  if (draftType === "ALL_TIME_XI") return true;
  return player.categories.includes(draftType);
}
