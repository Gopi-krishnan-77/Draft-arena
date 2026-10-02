"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { Player } from "@/types/player";
import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge, ROLE_TONE } from "@/components/shared/JerseyBadge";

export interface PlayerCardProps {
  player: Player;
  /** Already taken in this draft. Shows the dog-ear + dims the card. */
  drafted?: boolean;
  /** Team name to surface on the drafted tag (e.g. "GOPI'S XI"). */
  draftedBy?: string;
  /** When provided (and not drafted), renders the draft action button. */
  onDraft?: (player: Player) => void;
  /** Disables the action (e.g. not your turn / draft complete). */
  disabled?: boolean;
  actionLabel?: string;
  /** Action button colour — the picking manager's team colour. */
  actionIntent?: "primary" | "secondary";
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function PlayerCard({
  player,
  drafted = false,
  draftedBy,
  onDraft,
  disabled = false,
  actionLabel = "Draft",
  actionIntent = "primary",
  className,
}: PlayerCardProps) {
  const showAction = Boolean(onDraft) && !drafted;

  return (
    <article
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border-2 border-ink bg-surface shadow-hard transition-transform",
        drafted && "opacity-95",
        className
      )}
    >
      {/* crest: position + rating, with faint initials as a watermark */}
      <div className="relative flex aspect-[5/3] items-center justify-center overflow-hidden bg-gradient-to-br from-primary-container to-on-background">
        <span className="pointer-events-none select-none font-display-xl text-[68px] font-black italic leading-none text-surface/15">
          {initials(player.name)}
        </span>

        <span className="absolute left-2 top-2">
          <JerseyBadge tone={ROLE_TONE[player.role]}>{player.role}</JerseyBadge>
        </span>
        <span className="absolute right-2 top-2 flex items-center rounded-md border-2 border-ink bg-surface px-2 py-0.5">
          <span className="font-stats-num text-stats-num leading-none text-primary">
            {player.rating}
          </span>
        </span>

        {drafted && (
          <>
            <div className="absolute inset-0 bg-on-background/55" />
            <div className="dog-ear absolute right-0 top-0 h-10 w-10 bg-tertiary-fixed" />
            <div className="absolute inset-x-0 bottom-2 flex flex-col items-center gap-0.5">
              <JerseyBadge tone="accent">Drafted</JerseyBadge>
              {draftedBy && (
                <span className="font-display text-label-bold uppercase tracking-wide text-surface">
                  {draftedBy}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* info panel — solid background so name/meta are crisp */}
      <div className="flex flex-1 flex-col gap-2 border-t-2 border-ink bg-surface-container-low p-xs">
        <div>
          <h3 className="line-clamp-2 font-display text-headline-md font-bold uppercase leading-none text-on-surface">
            {player.name}
          </h3>
          {(player.club || player.nationality) && (
            <p className="mt-1 truncate font-sans text-xs text-on-surface-variant">
              {[player.club, player.nationality].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>

        {showAction && (
          <HardButton
            type="button"
            intent={actionIntent}
            size="sm"
            disabled={disabled}
            onClick={() => onDraft?.(player)}
            className="mt-auto w-full min-w-0 px-xs"
            title={actionLabel}
          >
            <span className="truncate">{actionLabel}</span>
          </HardButton>
        )}
      </div>
    </article>
  );
}
