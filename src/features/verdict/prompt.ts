import type { DraftType } from "@/features/draft-room/draft-types";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import type { ChatMessage } from "@/features/verdict/openrouter";
import type { VerdictMode } from "@/features/verdict/schema";
import type { TeamInput } from "@/features/verdict/types";

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

export function buildMessages(
  teams: [TeamInput, TeamInput],
  draftType: DraftType,
  mode: VerdictMode
): ChatMessage[] {
  const typeLabel = DRAFT_TYPE_MAP[draftType]?.label ?? draftType;

  const system = `${PERSONA[mode]}

You are judging a head-to-head football draft (mode: "${typeLabel}"). Two managers each drafted an XI. Compare the two squads and deliver a verdict.

Respond with ONLY a JSON object (no markdown, no prose) matching EXACTLY this shape:
{
  "headline": string,                       // ONE punchy, shareable line in your voice
  "predictedWinnerPosition": 0 | 1,         // which team wins
  "winProbability": [                       // must total 100
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

Rules: use the exact player names provided; keep the persona consistent throughout (including strengths/weaknesses/reasons, not just the headline); winProbability percents must be integers that sum to 100.`;

  const user = `${describeTeam(teams[0])}

${describeTeam(teams[1])}

Deliver your verdict as the JSON object described.`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
