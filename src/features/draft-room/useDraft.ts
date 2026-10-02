"use client";

import { useCallback, useMemo, useReducer } from "react";

import type { Player } from "@/types/player";
import type { DraftType } from "@/features/draft-room/draft-types";
import { ROSTER_SIZE, TOTAL_PICKS } from "@/features/draft-room/draft-types";
import { currentSlot, isDraftComplete, type PickSlot } from "@/features/draft-room/snake";

export interface DraftConfig {
  name: string;
  draftType: DraftType;
  managers: [string, string];
}

export interface TeamState {
  name: string;
  position: number;
  picks: Player[];
}

export interface PickRecord {
  pickNumber: number;
  round: number;
  position: number;
  player: Player;
  managerName: string;
}

interface DraftState {
  teams: [TeamState, TeamState];
  history: PickRecord[];
  pickedIds: Record<string, true>;
}

type DraftAction = { type: "PICK"; player: Player } | { type: "RESET" };

function init(config: DraftConfig): DraftState {
  return {
    teams: [
      { name: config.managers[0], position: 0, picks: [] },
      { name: config.managers[1], position: 1, picks: [] },
    ],
    history: [],
    pickedIds: {},
  };
}

function reducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "RESET":
      return { ...state, teams: [
        { ...state.teams[0], picks: [] },
        { ...state.teams[1], picks: [] },
      ], history: [], pickedIds: {} };

    case "PICK": {
      // Guard: draft over, or this player is already gone (no duplicate picks).
      if (isDraftComplete(state.history.length)) return state;
      if (state.pickedIds[action.player.id]) return state;

      const slot = currentSlot(state.history.length)!;
      const team = state.teams[slot.position];

      const updatedTeam: TeamState = { ...team, picks: [...team.picks, action.player] };
      const teams: [TeamState, TeamState] =
        slot.position === 0 ? [updatedTeam, state.teams[1]] : [state.teams[0], updatedTeam];

      return {
        teams,
        pickedIds: { ...state.pickedIds, [action.player.id]: true },
        history: [
          ...state.history,
          {
            pickNumber: slot.pickNumber,
            round: slot.round,
            position: slot.position,
            player: action.player,
            managerName: team.name,
          },
        ],
      };
    }

    default:
      return state;
  }
}

export interface DraftController {
  teams: [TeamState, TeamState];
  history: PickRecord[];
  pickedIds: Record<string, true>;
  slot: PickSlot | null;
  currentTeam: TeamState | null;
  isComplete: boolean;
  picksRemaining: number;
  totalPicks: number;
  rosterSize: number;
  pick: (player: Player) => void;
  reset: () => void;
}

/** Local-state engine for a 2-manager snake draft (hotseat). No persistence. */
export function useDraft(config: DraftConfig): DraftController {
  const [state, dispatch] = useReducer(reducer, config, init);

  const pick = useCallback((player: Player) => dispatch({ type: "PICK", player }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return useMemo(() => {
    const slot = currentSlot(state.history.length);
    return {
      teams: state.teams,
      history: state.history,
      pickedIds: state.pickedIds,
      slot,
      currentTeam: slot ? state.teams[slot.position] : null,
      isComplete: slot === null,
      picksRemaining: TOTAL_PICKS - state.history.length,
      totalPicks: TOTAL_PICKS,
      rosterSize: ROSTER_SIZE,
      pick,
      reset,
    };
  }, [state, pick, reset]);
}
