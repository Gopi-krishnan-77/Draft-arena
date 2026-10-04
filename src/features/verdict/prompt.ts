import type { DraftType } from "@/features/draft-room/draft-types";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import type { ChatMessage } from "@/features/verdict/openrouter";
import type { VerdictMode } from "@/features/verdict/schema";
import type { TeamInput } from "@/features/verdict/types";
import type { MatchResult } from "@/features/verdict/engine";

const PERSONA: Record<VerdictMode, string> = {
  ANALYST:
    "You are a measured, tactical football analyst. Cool, precise, data-led. No hype, no jokes — just sharp insight into balance, partnerships, and gaps.",
  COMMENTATOR:
    "You are a high-energy live football commentator. Present tense, breathless excitement, vivid imagery, the occasional exclamation. Make it feel like matchday.",
  HISTORIAN:
    "You are a reverent football historian. You place players in the grand sweep of the game's history, weigh eras against each other, and speak with gravitas and respect.",
  TRASH_TALK:
    "You are a savage but PLAYFUL trash-talker. Roast the weak picks by name, hype the strong ones, be funny and merciless — but never genuinely mean or offensive. Punchlines over paragraphs.",
};

const TEMPERATURE: Record<VerdictMode, number> = {
  ANALYST: 0.4,
  COMMENTATOR: 0.85,
  HISTORIAN: 0.7,
  TRASH_TALK: 0.95,
};

export function temperatureFor(mode: VerdictMode): number {
  return TEMPERATURE[mode];
}

function describeTeam(team: TeamInput): string {
  const roster = team.players
    .map((p) => `  - ${p.name} (${p.role}, ${p.rating})`)
    .join("\n");
  return `Team ${team.position} — "${team.name}":\n${roster}`;
}

function describeResult(teams: [TeamInput, TeamInput], match: MatchResult): string {
  const line = (pos: 0 | 1) => {
    const r = match.ratings[pos];
    const f = (n: number) => n.toFixed(1);
    return `  - Team ${pos} "${teams[pos].name}": GK ${f(r.lines.GK)}, DEF ${f(r.lines.DEF)}, MID ${f(r.lines.MID)}, FWD ${f(r.lines.FWD)} → strength ${f(r.strength)}, win chance ${match.percents[pos]}%`;
  };
  const winner = teams[match.winnerPosition].name;
  return `Match engine result (FINAL — do not change it):
${line(0)}
${line(1)}
  - Winner: Team ${match.winnerPosition} "${winner}"`;
}

/** Lines that break the "everyone at their peak" rule — used to trigger a rewrite. */
export const AGE_TALK = /\b(ag(e)?ing|aged|old(er)?|veteran|elderly|past (his|their) (prime|best)|twilight|declin\w*|slowed|slowing|legs (have )?(gone|slowed)|over the hill|creaking|retire\w*)\b/i;

export const PRIME_RULE =
  "Every player is judged at their absolute PEAK — the prime-age, best-form version of them. Never mention age, ageing, veterans, decline, slowing legs, fitness worries or career stage.";

export function buildMessages(
  teams: [TeamInput, TeamInput],
  draftType: DraftType,
  mode: VerdictMode,
  match: MatchResult
): ChatMessage[] {
  const typeLabel = DRAFT_TYPE_MAP[draftType]?.label ?? draftType;

  const system = `${PERSONA[mode]}

You are judging a head-to-head football draft (mode: "${typeLabel}"). Two managers each drafted an XI. A match engine has already rated both squads line by line and decided the result. Your job is to explain it: compare the two squads and write a verdict that AGREES with the engine's winner and odds.

${PRIME_RULE}

Respond with ONLY a JSON object (no markdown, no prose) matching EXACTLY this shape:
{
  "headline": string,                       // ONE punchy, shareable line in your voice
  "predictedWinnerPosition": 0 | 1,         // copy the engine's winner
  "winProbability": [                       // copy the engine's win chances
    { "position": 0, "percent": number },
    { "position": 1, "percent": number }
  ],
  "teams": [
    {
      "position": 0,
      "teamName": string,
      "strengths": [string, ...],           // 2-4 items
      "weaknesses": [string, ...],          // 2-4 items
      "bestPick": { "player": string, "reason": string },
      "worstPick": { "player": string, "reason": string }
    },
    { "position": 1, ... }                   // same shape for team 1
  ]
}

Rules: use the exact player names provided; the headline and analysis must back the engine's winner (a close margin can be called close, but never pick the other side); ground strengths and weaknesses in the squads and line ratings; keep the persona consistent throughout (including strengths/weaknesses/reasons, not just the headline); ${PRIME_RULE}`;

  const user = `${describeTeam(teams[0])}

${describeTeam(teams[1])}

${describeResult(teams, match)}

Deliver your verdict as the JSON object described.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
