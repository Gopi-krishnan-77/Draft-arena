import { cn } from "@/lib/utils";
import type { FormationSlot } from "@/features/draft-room/formation";

/** Live squad-composition status for the picking team: count / max per position. */
export function FormationBar({ slots, teamName }: { slots: FormationSlot[]; teamName: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-md border-2 border-ink bg-surface-container px-xs py-2 sm:flex-row sm:items-center sm:gap-2">
      <span className="font-label-bold text-label-bold uppercase text-on-surface-variant">
        {teamName}&apos;s XI · positions
      </span>
      <div className="flex flex-1 flex-wrap gap-1">
        {slots.map((slot) => (
          <span
            key={slot.role}
            title={`${slot.role}: need ${slot.min}, max ${slot.max}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-sm border-2 border-ink px-xs py-0.5 font-label-bold text-label-bold uppercase",
              slot.atMax
                ? "bg-on-background text-surface/70"
                : slot.needed
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-tertiary-fixed text-on-tertiary-fixed"
            )}
          >
            {slot.role} {slot.count}/{slot.max}
          </span>
        ))}
      </div>
    </div>
  );
}
