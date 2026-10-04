import "server-only";

import type { DraftType } from "@/features/draft-room/draft-types";
import { callOpenRouter } from "@/features/verdict/openrouter";
import { AGE_TALK, PRIME_RULE, buildMessages, temperatureFor } from "@/features/verdict/prompt";
import { simulateMatch, type MatchResult } from "@/features/verdict/engine";
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

/** The engine owns the result: stamp its winner and odds over whatever the model echoed. */
function applyMatch(result: VerdictResult, match: MatchResult): VerdictResult {
  return {
    ...result,
    predictedWinnerPosition: match.winnerPosition,
    winProbability: [
      { position: 0, percent: match.percents[0] },
      { position: 1, percent: match.percents[1] },
    ],
  };
}

/** True if any prose in the verdict talks about age / decline. */
function mentionsAge(result: VerdictResult): boolean {
  const text = [
    result.headline,
    ...result.teams.flatMap((t) => [
      ...t.strengths,
      ...t.weaknesses,
      t.bestPick.reason,
      t.worstPick.reason,
    ]),
  ].join(" \n ");
  return AGE_TALK.test(text);
}

/** Generate a verdict for two squads. Retries once on malformed output. */
export async function runVerdict(
  teams: [TeamInput, TeamInput],
  draftType: DraftType,
  mode: VerdictMode
): Promise<VerdictResult> {
  const match = simulateMatch(teams);
  const messages = buildMessages(teams, draftType, mode, match);
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

  // One rewrite if it slipped into "ageing veteran" talk; keep the original if
  // the rewrite fails to parse or is no better.
  if (mentionsAge(parsed)) {
    const retry = tryParse(
      await callOpenRouter(
        [
          ...messages,
          { role: "assistant", content: raw },
          { role: "user", content: `You described players as ageing or declining. ${PRIME_RULE} Rewrite the full JSON with every such reference removed.` },
        ],
        { temperature }
      ).catch(() => "")
    );
    if (retry && !mentionsAge(retry)) parsed = retry;
  }

  return applyMatch(parsed, match);
}
