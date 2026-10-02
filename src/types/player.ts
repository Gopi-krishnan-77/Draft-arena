export type PlayerRole = "GK" | "DEF" | "MID" | "FWD";

/** Special draft-type eligibility tags. ALL_TIME_XI is implicit (every player). */
export type DraftCategoryTag = "GOAT_XI" | "UNDERRATED_XI";

/** A draftable footballer. Mirrors the `players` table in Supabase. */
export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  /** Overall rating, 0–99. */
  rating: number;
  club?: string;
  nationality?: string;
  era?: string;
  imageUrl?: string;
  /** Which special draft types this player is eligible for. */
  categories: DraftCategoryTag[];
}
