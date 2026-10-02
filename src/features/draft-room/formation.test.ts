import { describe, expect, it } from "vitest";

import type { PlayerRole } from "@/types/player";
import { allowedRoles, countByRole, formationSlots } from "./formation";

const picks = (...roles: PlayerRole[]) => roles.map((role) => ({ role }));

describe("allowedRoles", () => {
  it("allows every position on an empty squad", () => {
    expect(allowedRoles([], 11)).toEqual(new Set(["GK", "DEF", "MID", "FWD"]));
  });

  it("locks GK after one keeper", () => {
    const allowed = allowedRoles(picks("GK"), 11);
    expect(allowed.has("GK")).toBe(false);
    expect(allowed.has("DEF")).toBe(true);
  });

  it("locks FWD at three forwards", () => {
    const allowed = allowedRoles(picks("FWD", "FWD", "FWD"), 11);
    expect(allowed.has("FWD")).toBe(false);
  });

  it("locks DEF and MID at five", () => {
    expect(allowedRoles(picks("DEF", "DEF", "DEF", "DEF", "DEF"), 11).has("DEF")).toBe(false);
    expect(allowedRoles(picks("MID", "MID", "MID", "MID", "MID"), 11).has("MID")).toBe(false);
  });

  it("forces the keeper when only one slot remains without one", () => {
    // 4 DEF + 4 MID + 2 FWD drafted, 1 pick left, no GK yet → only GK is legal.
    const squad = picks("DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD");
    expect(allowedRoles(squad, 11)).toEqual(new Set(["GK"]));
  });

  it("never allows a squad state with two unmet minimums and one slot", () => {
    // The guard prevents ever reaching 5 DEF + 4 MID with no GK/FWD and 2 left:
    // taking a 5th MID there would strand both the GK and FWD minimums.
    const ninePicks = picks("DEF", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID");
    expect(allowedRoles(ninePicks, 11).has("MID")).toBe(false);
  });

  it("never lets minimums become unreachable", () => {
    // 3 FWD + 4 MID (7 picks, 4 left): needs GK(1) + DEF(3) = exactly 4 → only GK/DEF legal.
    const squad = picks("FWD", "FWD", "FWD", "MID", "MID", "MID", "MID");
    const allowed = allowedRoles(squad, 11);
    expect(allowed).toEqual(new Set(["GK", "DEF"]));
  });

  it("returns nothing when the squad is full", () => {
    const full = picks("GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD");
    expect(allowedRoles(full, 11).size).toBe(0);
  });
});

describe("countByRole / formationSlots", () => {
  it("counts per position", () => {
    expect(countByRole(picks("GK", "DEF", "DEF", "FWD"))).toEqual({ GK: 1, DEF: 2, MID: 0, FWD: 1 });
  });

  it("flags unmet minimums and reached maximums", () => {
    const slots = formationSlots(picks("GK", "FWD", "FWD", "FWD"));
    const byRole = Object.fromEntries(slots.map((s) => [s.role, s]));
    expect(byRole.GK.atMax).toBe(true);
    expect(byRole.FWD.atMax).toBe(true);
    expect(byRole.DEF.needed).toBe(true);
    expect(byRole.MID.needed).toBe(true);
  });
});
