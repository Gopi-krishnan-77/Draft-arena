import { BouncingBall } from "@/components/shared/BouncingBall";

/** Full-width route loader: a bouncing football + label, shown while a server page renders. */
export function PageLoader({ label = "Warming up…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-[50dvh] flex-col items-center justify-center gap-sm text-center"
    >
      <BouncingBall />
      <p className="font-display text-headline-md uppercase text-on-surface-variant">{label}</p>
    </div>
  );
}
