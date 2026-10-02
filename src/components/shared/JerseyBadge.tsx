import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { PlayerRole } from "@/types/player";

/**
 * "Jersey Tag" chip — rectangular, slightly rounded, 2px navy border, condensed
 * uppercase label text. Used for positions, ranks and status flags.
 */
const jerseyBadgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm border-2 border-ink px-xs py-0.5 font-label-bold text-label-bold uppercase leading-none",
  {
    variants: {
      tone: {
        primary: "bg-primary text-on-primary",
        secondary: "bg-secondary-container text-on-secondary-container",
        accent: "bg-tertiary-fixed text-on-tertiary-fixed",
        dark: "bg-on-background text-surface",
        live: "bg-secondary text-on-secondary",
        neutral: "bg-surface-container text-on-surface",
        outline: "bg-surface text-on-surface",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

export type JerseyBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof jerseyBadgeVariants>;

export function JerseyBadge({ className, tone, ...props }: JerseyBadgeProps) {
  return <span className={cn(jerseyBadgeVariants({ tone, className }))} {...props} />;
}

/** Each playing position gets a distinct, high-contrast tag colour. */
export const ROLE_TONE: Record<PlayerRole, NonNullable<JerseyBadgeProps["tone"]>> = {
  GK: "accent",
  DEF: "primary",
  MID: "secondary",
  FWD: "dark",
};
