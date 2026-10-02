"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { DRAFT_TYPES, type DraftType } from "@/features/draft-room/draft-types";
import { createDraft, type ActionState } from "@/features/draft-room/actions";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <HardButton type="submit" intent="primary" size="lg" disabled={pending} className="w-full sm:w-auto">
      {pending ? "Creating…" : "Create Room"} <ArrowRight />
    </HardButton>
  );
}

interface Props {
  initialType?: DraftType;
  initialName: string;
}

export function CreateOnlineDraftForm({ initialType, initialName }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(createDraft, {});
  const [draftType, setDraftType] = useState<DraftType | "">(initialType ?? "");

  return (
    <form action={formAction} className="space-y-lg">
      <input type="hidden" name="draftType" value={draftType} />

      <fieldset className="space-y-sm">
        <legend className="font-display text-headline-md uppercase text-on-surface">Draft mode</legend>
        <div className="grid gap-sm md:grid-cols-3">
          {DRAFT_TYPES.map((type) => {
            const selected = draftType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setDraftType(type.id)}
                aria-pressed={selected}
                className={cn(
                  "flex flex-col items-start gap-xs rounded-xl border-2 border-ink bg-surface p-sm text-left transition-all active:translate-y-1 active:shadow-none",
                  selected ? "shadow-hard-primary ring-2 ring-primary" : "shadow-hard hover:-translate-y-0.5"
                )}
              >
                <JerseyBadge tone={TONE_MAP[type.tone]}>{type.label}</JerseyBadge>
                <span className="font-sans text-sm text-on-surface-variant">{type.tagline}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="space-y-xs">
        <label htmlFor="name" className="font-display text-headline-md uppercase text-on-surface">
          Draft name
        </label>
        <Input id="name" name="name" placeholder="e.g. The GOAT Showdown" maxLength={40} />
      </div>

      <div className="space-y-xs">
        <label htmlFor="displayName" className="font-display text-headline-md uppercase text-on-surface">
          Your manager name
        </label>
        <Input id="displayName" name="displayName" defaultValue={initialName} maxLength={20} />
      </div>

      {state.error && (
        <p className="rounded-md border-2 border-error bg-error-container px-sm py-xs font-sans text-sm text-on-error-container">
          {state.error}
        </p>
      )}

      <SubmitButton />
      <p className="font-sans text-sm text-on-surface-variant">
        You&apos;ll get a shareable link to invite your opponent on the next screen.
      </p>
    </form>
  );
}
