import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * The signature Arena action button: pill-shaped, 2px navy border, hard-offset
 * shadow. On press it sinks (translateY) and the shadow collapses — the
 * "physical sticker" interaction from design.md. Use `asChild` to render a Link.
 */
const hardButtonVariants = cva(
  "inline-flex items-center justify-center gap-xs whitespace-nowrap rounded-full border-2 border-ink font-display uppercase leading-none tracking-wide transition-all duration-100 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      intent: {
        primary: "bg-primary text-on-primary shadow-hard hover:bg-primary-container",
        secondary:
          "bg-secondary-container text-on-secondary-container shadow-hard hover:brightness-105",
        accent: "bg-tertiary-fixed text-on-tertiary-fixed shadow-hard hover:brightness-105",
        dark: "bg-on-background text-surface shadow-hard hover:bg-inverse-surface",
        outline: "bg-surface text-on-surface shadow-hard hover:bg-surface-container",
      },
      size: {
        sm: "h-9 px-md text-label-bold [&_svg]:size-4",
        md: "h-12 px-lg text-headline-md [&_svg]:size-5",
        lg: "h-14 px-xl text-headline-md [&_svg]:size-6",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);

export interface HardButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof hardButtonVariants> {
  asChild?: boolean;
}

const HardButton = React.forwardRef<HTMLButtonElement, HardButtonProps>(
  ({ className, intent, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(hardButtonVariants({ intent, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
HardButton.displayName = "HardButton";

export { HardButton, hardButtonVariants };
