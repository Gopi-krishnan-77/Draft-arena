"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { TURN_SECONDS } from "@/features/draft-room/draft-types";

/** Milliseconds until `deadlineMs` (local-clock epoch), ticked twice a second. */
export function useCountdown(deadlineMs: number | null): number | null {
  const [remaining, setRemaining] = useState<number | null>(
    deadlineMs === null ? null : deadlineMs - Date.now()
  );

  useEffect(() => {
    if (deadlineMs === null) {
      setRemaining(null);
      return;
    }
    setRemaining(deadlineMs - Date.now());
    const id = setInterval(() => setRemaining(deadlineMs - Date.now()), 500);
    return () => clearInterval(id);
  }, [deadlineMs]);

  return remaining;
}

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The "On the Clock" ring — vibrant orange countdown per design.md. Pulses in
 * the final 10 seconds; reads "0" once the turn is claimable by auto-pick.
 */
export function PickCountdown({ remainingMs }: { remainingMs: number }) {
  const seconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const fraction = Math.max(0, Math.min(1, remainingMs / (TURN_SECONDS * 1000)));
  const urgent = seconds <= 10;

  return (
    <div
      className={cn("relative size-16 shrink-0 md:size-20", urgent && seconds > 0 && "animate-pulse-ring")}
      role="timer"
      aria-label={`${seconds} seconds left in this turn`}
    >
      <svg viewBox="0 0 60 60" className="size-full -rotate-90">
        <circle cx="30" cy="30" r={RADIUS} fill="none" strokeWidth="5" className="stroke-surface/20" />
        <circle
          cx="30"
          cy="30"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          className={cn("transition-[stroke-dashoffset] duration-500", urgent ? "stroke-secondary-container" : "stroke-tertiary-fixed")}
        />
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center font-stats-num text-[22px] md:text-[26px]",
          urgent ? "text-secondary-fixed-dim" : "text-surface"
        )}
      >
        {seconds}
      </span>
    </div>
  );
}
