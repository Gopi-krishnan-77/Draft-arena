"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

import { HardButton, type HardButtonProps } from "@/components/shared/HardButton";

interface Props extends Omit<HardButtonProps, "type" | "asChild"> {
  /** Label shown (next to a spinner) while the parent form's action runs. */
  pendingLabel?: React.ReactNode;
}

/** A form submit HardButton that disables itself and spins while the action is pending. */
export function SubmitButton({ children, pendingLabel, disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <HardButton type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </HardButton>
  );
}
