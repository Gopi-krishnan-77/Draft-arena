"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";
import type { DraftType } from "@/features/draft-room/draft-types";
import { generateHotseatVerdict, generateRoomVerdict } from "@/features/verdict/actions";
import type { VerdictMode, VerdictResult } from "@/features/verdict/schema";
import type { TeamInput } from "@/features/verdict/types";
import { VerdictCard } from "@/features/verdict/components/VerdictCard";
import { ModeSwitcher } from "@/features/verdict/components/ModeSwitcher";
import { ShareButton } from "@/features/verdict/components/ShareButton";
import { SaveImageButton } from "@/features/verdict/components/SaveImageButton";

type Props =
  | { kind: "online"; roomId: string; shareUrl: string }
  | { kind: "hotseat"; teams: [TeamInput, TeamInput]; draftType: DraftType };

export function VerdictView(props: Props) {
  const [mode, setMode] = useState<VerdictMode>("ANALYST");
  const [cache, setCache] = useState<Partial<Record<VerdictMode, VerdictResult>>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef<Set<VerdictMode>>(new Set());
  const cardRef = useRef<HTMLDivElement | null>(null);

  const generate = useCallback(
    async (m: VerdictMode) => {
      if (inFlight.current.has(m)) return;
      inFlight.current.add(m);
      setLoading(true);
      setError(null);
      const res =
        props.kind === "online"
          ? await generateRoomVerdict(props.roomId, m)
          : await generateHotseatVerdict({ teams: props.teams, draftType: props.draftType, mode: m });
      inFlight.current.delete(m);
      if (res.error) setError(res.error);
      else if (res.result) setCache((c) => ({ ...c, [m]: res.result }));
      setLoading(false);
    },
    [props]
  );

  useEffect(() => {
    if (!cache[mode]) generate(mode);
  }, [mode, cache, generate]);

  const current = cache[mode];

  return (
    <div className="space-y-md">
      <ModeSwitcher mode={mode} onModeChange={setMode} disabled={loading} />

      {current ? (
        <>
          <div ref={cardRef}>
            <VerdictCard result={current} />
          </div>
          <div className="flex flex-wrap justify-center gap-sm">
            <ShareButton
              headline={current.headline}
              url={props.kind === "online" ? props.shareUrl : undefined}
            />
            <SaveImageButton targetRef={cardRef} />
          </div>
        </>
      ) : loading ? (
        <div className="flex flex-col items-center gap-sm rounded-xl border-2 border-ink bg-on-background p-xl text-center shadow-hard">
          <Loader2 className="size-8 animate-spin text-tertiary-fixed" />
          <p className="font-display text-headline-md uppercase text-surface">The AI is judging…</p>
          <p className="font-sans text-sm text-surface/70">
            Weighing both XIs. This can take up to 30–40 seconds.
          </p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-sm rounded-xl border-2 border-error bg-error-container p-lg text-center">
          <p className="font-sans text-body-md text-on-error-container">{error}</p>
          <HardButton intent="primary" onClick={() => generate(mode)}>
            <Sparkles /> Try again
          </HardButton>
        </div>
      ) : null}
    </div>
  );
}
