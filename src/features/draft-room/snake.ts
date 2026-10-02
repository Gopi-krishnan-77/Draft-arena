import { PARTICIPANTS, ROSTER_SIZE, TOTAL_PICKS } from "@/features/draft-room/draft-types";

export interface PickSlot {
  /** 1-based round number. */
  round: number;
  /** 1-based global pick number. */
  pickNumber: number;
  /** 0-based seat whose turn it is. */
  position: number;
}

/**
 * Serpentine ("snake") order. With P managers, round 1 goes 0,1,…,P-1 and every
 * subsequent round reverses. For V1 P=2, so the order is 0,1,1,0,0,1,…
 *
 * Pure and dependency-free — the one place a bug silently corrupts every draft.
 */
export function positionForPick(pickIndex: number, participants: number = PARTICIPANTS): number {
  const round = Math.floor(pickIndex / participants); // 0-based
  const indexInRound = pickIndex % participants;
  return round % 2 === 0 ? indexInRound : participants - 1 - indexInRound;
}

export function slotForPick(pickIndex: number, participants: number = PARTICIPANTS): PickSlot {
  return {
    round: Math.floor(pickIndex / participants) + 1,
    pickNumber: pickIndex + 1,
    position: positionForPick(pickIndex, participants),
  };
}

/**
 * Whose turn is it, given how many picks have already been made?
 * Returns null when the draft is complete.
 */
export function currentSlot(
  picksMade: number,
  participants: number = PARTICIPANTS,
  rosterSize: number = ROSTER_SIZE
): PickSlot | null {
  if (picksMade >= participants * rosterSize) return null;
  return slotForPick(picksMade, participants);
}

export function isDraftComplete(
  picksMade: number,
  participants: number = PARTICIPANTS,
  rosterSize: number = ROSTER_SIZE
): boolean {
  return picksMade >= participants * rosterSize;
}

/** The full draft order as a flat list of slots — handy for previews/boards. */
export function buildDraftOrder(
  participants: number = PARTICIPANTS,
  rosterSize: number = ROSTER_SIZE
): PickSlot[] {
  return Array.from({ length: participants * rosterSize }, (_, i) => slotForPick(i, participants));
}

export { TOTAL_PICKS };
