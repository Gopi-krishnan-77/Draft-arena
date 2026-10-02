"use client";

import { RotateCcw } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-md py-xl text-center">
      <JerseyBadge tone="live">Own goal</JerseyBadge>
      <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface">
        Something broke
      </h1>
      <p className="font-sans text-body-md text-on-surface-variant">
        An unexpected error interrupted play. Give it another go.
      </p>
      <div className="flex justify-center">
        <HardButton intent="primary" onClick={reset}>
          <RotateCcw /> Try again
        </HardButton>
      </div>
    </div>
  );
}
