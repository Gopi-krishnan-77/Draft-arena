import { z } from "zod";

export const VERDICT_MODES = [
  { id: "ANALYST", label: "Analyst", blurb: "Measured & tactical" },
  { id: "COMMENTATOR", label: "Commentator", blurb: "Live-broadcast hype" },
  { id: "HISTORIAN", label: "Historian", blurb: "Reverent & era-spanning" },
  { id: "TRASH_TALK", label: "Trash Talk", blurb: "Savage but playful" },
] as const;

export type VerdictMode = (typeof VERDICT_MODES)[number]["id"];

export const VERDICT_MODE_IDS = VERDICT_MODES.map((m) => m.id) as [VerdictMode, ...VerdictMode[]];

export function isVerdictMode(value: string): value is VerdictMode {
  return VERDICT_MODES.some((m) => m.id === value);
}

const teamVerdict = z.object({
  position: z.number().int().min(0).max(1),
  teamName: z.string(),
  strengths: z.array(z.string()).min(2).max(4),
  weaknesses: z.array(z.string()).min(2).max(4),
  bestPick: z.object({ player: z.string(), reason: z.string() }),
  worstPick: z.object({ player: z.string(), reason: z.string() }),
});

export const verdictResultSchema = z
  .object({
    headline: z.string().min(1),
    predictedWinnerPosition: z.number().int().min(0).max(1),
    winProbability: z
      .array(z.object({ position: z.number().int().min(0).max(1), percent: z.number().int().min(0).max(100) }))
      .length(2),
    teams: z.array(teamVerdict).length(2),
  })
  .superRefine((val, ctx) => {
    // Both arrays must cover positions 0 AND 1 — a model reply that doubles up
    // a position would otherwise render two winners / a fabricated bar.
    if (new Set(val.teams.map((t) => t.position)).size !== 2) {
      ctx.addIssue({ code: "custom", message: "teams must cover positions 0 and 1" });
    }
    if (new Set(val.winProbability.map((w) => w.position)).size !== 2) {
      ctx.addIssue({ code: "custom", message: "winProbability must cover positions 0 and 1" });
    }
  });

export type VerdictResult = z.infer<typeof verdictResultSchema>;
