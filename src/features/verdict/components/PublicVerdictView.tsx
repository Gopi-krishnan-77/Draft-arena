"use client";

import { useRef, useState } from "react";

import { VERDICT_MODE_IDS, type VerdictMode, type VerdictResult } from "@/features/verdict/schema";
import { VerdictCard } from "@/features/verdict/components/VerdictCard";
import { ModeSwitcher } from "@/features/verdict/components/ModeSwitcher";
import { ShareButton } from "@/features/verdict/components/ShareButton";
import { SaveImageButton } from "@/components/shared/SaveImageButton";

interface Props {
  verdicts: Partial<Record<VerdictMode, VerdictResult>>;
  shareUrl: string;
}

/** Read-only verdict for visitors: flip between the modes the managers already generated. */
export function PublicVerdictView({ verdicts, shareUrl }: Props) {
  const available = VERDICT_MODE_IDS.filter((m) => verdicts[m]);
  const [mode, setMode] = useState<VerdictMode | undefined>(available[0]);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const current = mode ? verdicts[mode] : undefined;

  if (!mode || !current) {
    return (
      <div className="rounded-xl border-2 border-ink bg-on-background p-lg text-center shadow-hard">
        <p className="font-display text-headline-md uppercase text-surface">No verdict yet</p>
        <p className="mt-xs font-sans text-sm text-surface/70">
          The managers haven&apos;t asked the AI to judge this one. Check the squads below and make
          your own call.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-md">
      {available.length > 1 && (
        <ModeSwitcher mode={mode} onModeChange={setMode} available={available} />
      )}
      <div ref={cardRef}>
        <VerdictCard result={current} />
      </div>
      <div className="flex flex-wrap justify-center gap-sm">
        <ShareButton headline={current.headline} url={shareUrl} />
        <SaveImageButton targetRef={cardRef} />
      </div>
    </div>
  );
}
