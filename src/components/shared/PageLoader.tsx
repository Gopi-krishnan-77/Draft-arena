import { Loader2 } from "lucide-react";

/** Full-width route loader: spinner + label, shown while a server page renders. */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50dvh] flex-col items-center justify-center gap-sm text-center"
    >
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="font-display text-headline-md uppercase text-on-surface-variant">{label}</p>
    </div>
  );
}
