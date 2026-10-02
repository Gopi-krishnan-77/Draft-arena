import "server-only";

import type { DraftType } from "@/features/draft-room/draft-types";
import { callOpenRouter } from "@/features/verdict/openrouter";
import { buildMessages, temperatureFor } from "@/features/verdict/prompt";
import { verdictResultSchema, type VerdictMode, type VerdictResult } from "@/features/verdict/schema";
import type { TeamInput } from "@/features/verdict/types";

function tryParse(raw: string): VerdictResult | null {
  const fenceless = raw.replace(/```(?:json)?/gi, "").trim();
  // Also try the substring from the first "{" to the last "}", in case a chatty
  // (often free) model wrapped the JSON in prose or a reasoning preamble.
  const start = fenceless.indexOf("{");
  const end = fenceless.lastIndexOf("}");
  const sliced = start >= 0 && end > start ? fenceless.slice(start, end + 1) : fenceless;

  for (const candidate of [fenceless, sliced]) {
    try {
      const parsed = verdictResultSchema.safeParse(JSON.parse(candidate));
      if (parsed.success) return parsed.data;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

/** Force win probabilities to sum to 100 and keep the winner consistent. */
function normalize(result: VerdictResult): VerdictResult {
  const [a, b] = result.winProbability;
  let pa = a.percent;
  let pb = b.percent;
  if (pa + pb !== 100) {
    const total = pa + pb || 1;
    pa = Math.round((pa / total) * 100);
    pb = 100 - pa;
  }
  const winner = pa === pb ? result.predictedWinnerPosition : pa > pb ? a.position : b.position;
  return {
    ...result,
    winProbability: [
      { position: a.position, percent: pa },
      { position: b.position, percent: pb },
    ],
    predictedWinnerPosition: winner,
  };
}

/** Generate a verdict for two squads. Retries once on malformed output. */
export async function runVerdict(
  teams: [TeamInput, TeamInput],
  draftType: DraftType,
  mode: VerdictMode
): Promise<VerdictResult> {
  const messages = buildMessages(teams, draftType, mode);
  const temperature = temperatureFor(mode);

  let raw = await callOpenRouter(messages, { temperature });
  let parsed = tryParse(raw);

  if (!parsed) {
    raw = await callOpenRouter(
      [...messages, { role: "user", content: "Your previous reply was invalid. Return ONLY the JSON object, matching the schema exactly." }],
      { temperature }
    );
    parsed = tryParse(raw);
  }

  if (!parsed) throw new Error("The AI returned malformed output");
  return normalize(parsed);
}
