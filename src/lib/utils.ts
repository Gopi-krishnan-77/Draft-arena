import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Our design system exposes typography as `text-*` size tokens (text-headline-md,
 * text-stats-num, ...). tailwind-merge doesn't know these are *sizes*, so by
 * default it treats them as text-colors and drops a real color class that sits
 * alongside (e.g. a button with both `text-headline-md` and `text-on-primary`).
 * Register the tokens in the font-size group so size and color coexist.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "headline-lg",
            "headline-lg-mobile",
            "headline-md",
            "body-lg",
            "body-md",
            "label-bold",
            "stats-num",
          ],
        },
      ],
    },
  },
});

/** Merge conditional class names and resolve Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Constrain a user-supplied redirect target to an internal path. Rejects
 * protocol-relative escapes ("//evil.com", "/\evil.com") that pass a naive
 * startsWith("/") check — browsers resolve those off-site.
 */
export function safeInternalPath(value: unknown, fallback = "/"): string {
  return typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : fallback;
}
