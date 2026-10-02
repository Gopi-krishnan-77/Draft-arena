import { cn } from "@/lib/utils";
import { VERDICT_MODES, type VerdictMode } from "@/features/verdict/schema";

interface Props {
  mode: VerdictMode;
  onModeChange: (mode: VerdictMode) => void;
  disabled?: boolean;
}

/** Tabs to flip between the four verdict personalities. */
export function ModeSwitcher({ mode, onModeChange, disabled }: Props) {
  return (
    <div className="grid grid-cols-2 gap-xs sm:grid-cols-4">
      {VERDICT_MODES.map((m) => {
        const active = m.id === mode;
        return (
          <button
            key={m.id}
            type="button"
            disabled={disabled}
            onClick={() => onModeChange(m.id)}
            aria-pressed={active}
            className={cn(
              "flex flex-col items-start gap-0.5 rounded-md border-2 border-ink px-xs py-2 text-left transition-all active:translate-y-0.5 disabled:opacity-50",
              active ? "bg-primary text-on-primary shadow-hard-sm" : "bg-surface text-on-surface hover:bg-surface-container"
            )}
          >
            <span className="font-display text-headline-md uppercase leading-none">{m.label}</span>
            <span className={cn("font-sans text-xs", active ? "text-on-primary/80" : "text-on-surface-variant")}>
              {m.blurb}
            </span>
          </button>
        );
      })}
    </div>
  );
}
