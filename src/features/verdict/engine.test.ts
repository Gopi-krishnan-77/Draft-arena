import { describe, expect, it } from "vitest";

import type { TeamInput } from "./types";
import { simulateMatch } from "./engine";

const LAYOUT = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"];
const team = (position: number, rating: number | number[]): TeamInput => ({
  position,
  name: `T${position}`,
  players: LAYOUT.map((role, i) => ({
    name: `${role}${i}`,
    role,
    rating: Array.isArray(rating) ? rating[i] : rating,
  })),
});

describe("simulateMatch", () => {
  it("is deterministic", () => {
    const teams: [TeamInput, TeamInput] = [team(0, 90), team(1, 88)];
    expect(simulateMatch(teams)).toEqual(simulateMatch(teams));
  });

  it("favours the stronger squad with percents summing to 100", () => {
    const { winnerPosition, percents } = simulateMatch([team(0, 86), team(1, 89)]);
    expect(winnerPosition).toBe(1);
    expect(percents[0] + percents[1]).toBe(100);
    expect(percents[1]).toBeGreaterThan(50);
  });

  it("keeps close squads close", () => {
    const { percents } = simulateMatch([team(0, 89), team(1, 88)]);
    expect(percents[0]).toBeGreaterThan(50);
    expect(percents[0]).toBeLessThan(65);
  });

  it("caps lopsided matchups", () => {
    const { percents } = simulateMatch([team(0, 99), team(1, 80)]);
    expect(percents).toEqual([85, 15]);
  });

  it("never returns a 50–50 draw", () => {
    const { percents, winnerPosition } = simulateMatch([team(0, 88), team(1, 88)]);
    expect(percents).toEqual([51, 49]);
    expect(winnerPosition).toBe(0);
  });
});
