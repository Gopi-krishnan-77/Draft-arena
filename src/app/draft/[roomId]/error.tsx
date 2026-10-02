"use client";

import Link from "next/link";
import { RotateCcw } from "lucide-react";

import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";

export default function RoomError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-md py-xl text-center">
      <JerseyBadge tone="live">VAR check failed</JerseyBadge>
      <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface">
        Something went wrong in the arena
      </h1>
      <p className="font-sans text-body-md text-on-surface-variant">
        The room hit an unexpected error. Your picks are safe — try reloading.
      </p>
      <div className="flex justify-center gap-sm">
        <HardButton intent="primary" onClick={reset}>
          <RotateCcw /> Reload room
        </HardButton>
        <HardButton asChild intent="outline">
          <Link href="/">Back home</Link>
        </HardButton>
      </div>
    </div>
  );
}
