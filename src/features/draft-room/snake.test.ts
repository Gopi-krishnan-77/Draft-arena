import { describe, expect, it } from "vitest";

import { buildDraftOrder, currentSlot, isDraftComplete, positionForPick, slotForPick } from "./snake";

describe("snake draft order (2 managers, 11 rounds)", () => {
  it("serpentines 0,1,1,0,0,1,…", () => {
    const positions = Array.from({ length: 22 }, (_, i) => positionForPick(i, 2));
    const expected = Array.from({ length: 22 }, (_, i) => {
      const round = Math.floor(i / 2);
      const inRound = i % 2;
      return round % 2 === 0 ? inRound : 1 - inRound;
    });
    expect(positions).toEqual(expected);
    expect(positions.slice(0, 6)).toEqual([0, 1, 1, 0, 0, 1]);
  });

  it("each manager gets exactly 11 picks", () => {
    const order = buildDraftOrder(2, 11);
    expect(order).toHaveLength(22);
    expect(order.filter((s) => s.position === 0)).toHaveLength(11);
    expect(order.filter((s) => s.position === 1)).toHaveLength(11);
  });

  it("numbers rounds and picks 1-based", () => {
    expect(slotForPick(0, 2)).toEqual({ round: 1, pickNumber: 1, position: 0 });
    expect(slotForPick(21, 2)).toEqual({ round: 11, pickNumber: 22, position: 1 });
  });

  it("ends after 22 picks", () => {
    expect(currentSlot(21, 2, 11)).not.toBeNull();
    expect(currentSlot(22, 2, 11)).toBeNull();
    expect(isDraftComplete(22, 2, 11)).toBe(true);
    expect(isDraftComplete(21, 2, 11)).toBe(false);
  });

  it("consecutive picks at every round turn belong to the same manager", () => {
    const order = buildDraftOrder(2, 11);
    for (let i = 1; i < order.length - 1; i += 2) {
      // picks i and i+1 straddle a round boundary → same position (the snake turn)
      expect(order[i].position).toBe(order[i + 1].position);
    }
  });
});
