import "server-only";

import { cache } from "react";

import type { Player } from "@/types/player";
import type { DraftTypeEnum, Json } from "@/types/database";
import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { rowToPlayer } from "@/features/draft-room/queries";
import type { TeamState } from "@/features/draft-room/useDraft";
import {
  VERDICT_MODE_IDS,
  verdictResultSchema,
  type VerdictMode,
  type VerdictResult,
} from "@/features/verdict/schema";

export interface PublicVerdict {
  room: { id: string; name: string; draftType: DraftTypeEnum };
  /** Whether the current viewer managed one of the two teams. */
  isParticipant: boolean;
  teams: [TeamState, TeamState];
  /** Verdicts already generated for this draft, by mode. */
  verdicts: Partial<Record<VerdictMode, VerdictResult>>;
}

interface RawPublicVerdict {
  room: PublicVerdict["room"];
  isParticipant: boolean;
  teams: {
    position: number;
    name: string;
    players: { id: string; name: string; role: Player["role"]; rating: number; metadata: Json }[];
  }[];
  verdicts: Record<string, unknown>;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A finished draft's public view (both XIs + cached verdicts), readable without
 * signing in via the get_public_verdict() RPC. Null unless the room exists and
 * is COMPLETED. Memoized per request — the page, its metadata and the preview
 * image all ask for it.
 */
export const getPublicVerdict = cache(async (roomId: string): Promise<PublicVerdict | null> => {
  if (!isSupabaseConfigured() || !UUID_RE.test(roomId)) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_verdict", { p_room_id: roomId });
  if (error || !data) return null;
  const raw = data as unknown as RawPublicVerdict;

  const team = (position: number): TeamState => {
    const t = raw.teams.find((x) => x.position === position);
    return {
      name: t?.name ?? `Manager ${position + 1}`,
      position,
      picks: (t?.players ?? []).map(rowToPlayer),
    };
  };

  // Validate cached rows — older or hand-written rows shouldn't crash the page.
  const verdicts: PublicVerdict["verdicts"] = {};
  for (const mode of VERDICT_MODE_IDS) {
    const parsed = verdictResultSchema.safeParse(raw.verdicts?.[mode]);
    if (parsed.success) verdicts[mode] = parsed.data;
  }

  return {
    room: raw.room,
    isParticipant: raw.isParticipant,
    teams: [team(0), team(1)],
    verdicts,
  };
});

/** The verdict to lead with on previews: Analyst if it exists, else the first available. */
export function featuredVerdict(
  verdicts: PublicVerdict["verdicts"]
): { mode: VerdictMode; result: VerdictResult } | null {
  for (const mode of VERDICT_MODE_IDS) {
    const result = verdicts[mode];
    if (result) return { mode, result };
  }
  return null;
}
