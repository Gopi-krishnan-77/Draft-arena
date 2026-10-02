import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Chunky, 2px-bordered field per design.md. Focus swaps the border to Electric
 * Blue and adds a soft primary ring — the "sports-media" focus treatment.
 */
const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-md border-2 border-ink bg-surface-container-lowest px-4 py-2 text-body-md text-on-surface transition-colors file:border-0 file:bg-transparent file:text-body-md placeholder:text-on-surface-variant focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
