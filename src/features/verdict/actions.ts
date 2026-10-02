"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { Json } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/user";
import { getPlayers, getRoomState } from "@/features/draft-room/queries";
import { runVerdict } from "@/features/verdict/generate";
import { getModelName } from "@/features/verdict/openrouter";
import {
  VERDICT_MODE_IDS,
  type VerdictMode,
  type VerdictResult,
} from "@/features/verdict/schema";
import type { TeamInput } from "@/features/verdict/types";

export interface VerdictState {
  result?: VerdictResult;
  error?: string;
}

const teamInputSchema = z.object({
  position: z.number().int().min(0).max(1),
  name: z.string().min(1),
  players: z.array(z.object({ name: z.string(), role: z.string(), rating: z.number() })).min(1),
});

const hotseatSchema = z.object({
  teams: z.array(teamInputSchema).length(2),
  draftType: z.enum(["GOAT_XI", "ALL_TIME_XI", "UNDERRATED_XI"]),
  mode: z.enum(VERDICT_MODE_IDS),
});

function verdictError(e: unknown): VerdictState {
  const message = e instanceof Error ? e.message : "";
  if (message.includes("OPENROUTER_API_KEY")) {
    return { error: "AI isn't configured yet — add OPENROUTER_API_KEY to .env.local (see SETUP.md §6)." };
  }
  if (message.includes("Paid model(s) blocked")) {
    return { error: "The configured AI model isn't free, so it was blocked to avoid charges. Use a \":free\" model in OPENROUTER_MODEL." };
  }
  if (message.includes("429")) {
    return { error: "The free AI is busy right now. Give it a few seconds and try again." };
  }
  if (e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError")) {
    return { error: "The AI took too long to answer. Please try again." };
  }
  return { error: "The AI couldn't generate a verdict. Please try again." };
}

// Best-effort abuse guard for the unauthenticated hotseat endpoint. In-memory
// per server instance — good enough for an MVP, replace with a real limiter at scale.
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 8;
const rateHits = new Map<string, number[]>();

async function isRateLimited(): Promise<boolean> {
  const h = await headers();
  // Prefer the platform-set header; otherwise take the LAST forwarded hop
  // (appended by the trusted proxy) — the first entry is client-controlled
  // and trivially spoofable per request.
  const forwarded = (h.get("x-forwarded-for") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ip = h.get("x-real-ip") ?? forwarded[forwarded.length - 1] ?? "local";
  const now = Date.now();
  const recent = (rateHits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  rateHits.set(ip, recent);
  return false;
}

/** Ephemeral verdict for a hotseat (local) draft — not persisted. */
export async function generateHotseatVerdict(input: unknown): Promise<VerdictState> {
  const parsed = hotseatSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid teams." };
  if (await isRateLimited()) {
    return { error: "Easy, gaffer — too many verdicts at once. Try again in a few minutes." };
  }
  const { teams, draftType, mode } = parsed.data;
  try {
    const result = await runVerdict(teams as [TeamInput, TeamInput], draftType, mode);
    return { result };
  } catch (e) {
    return verdictError(e);
  }
}

/** Cached verdict for an online room, keyed by (room, mode). Participants only. */
export async function generateRoomVerdict(roomId: string, mode: VerdictMode): Promise<VerdictState> {
  const user = await requireUser();
  const supabase = await createClient();

  // Return the cached verdict for this mode if it exists.
  const { data: cached } = await supabase
    .from("draft_analyses")
    .select("result")
    .eq("room_id", roomId)
    .eq("mode", mode)
    .maybeSingle();
  if (cached) return { result: cached.result as unknown as VerdictResult };

  const state = await getRoomState(roomId);
  if (!state) return { error: "Draft not found." };
  if (state.room.status !== "COMPLETED") return { error: "Finish the draft first." };
  if (!state.participants.some((p) => p.userId === user.id)) {
    return { error: "You're not in this draft." };
  }

  const players = await getPlayers(state.room.draftType);
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const teams = [0, 1].map<TeamInput>((position) => {
    const participant = state.participants.find((p) => p.position === position);
    const teamPlayers = state.picks
      .filter((pk) => pk.position === position)
      .map((pk) => playerMap.get(pk.playerId))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .map((p) => ({ name: p.name, role: p.role, rating: p.rating }));
    return { position, name: participant?.displayName ?? `Manager ${position + 1}`, players: teamPlayers };
  }) as [TeamInput, TeamInput];

  let result: VerdictResult;
  try {
    result = await runVerdict(teams, state.room.draftType, mode);
  } catch (e) {
    return verdictError(e);
  }

  // Persist (ignore a rare unique-violation race — the verdict is still returned).
  await supabase
    .from("draft_analyses")
    .insert({ room_id: roomId, mode, model: getModelName(), result: result as unknown as Json });

  return { result };
}
