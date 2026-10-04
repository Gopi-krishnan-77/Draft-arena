"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { DRAFT_TYPES, type DraftType } from "@/features/draft-room/draft-types";
import { createDraftSchema } from "@/features/draft-room/schema";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

type FieldErrors = Partial<Record<"name" | "draftType" | "managerA" | "managerB", string>>;

export function CreateDraftForm({ initialType }: { initialType?: DraftType }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [draftType, setDraftType] = useState<DraftType | "">(initialType ?? "");
  const [managerA, setManagerA] = useState("");
  const [managerB, setManagerB] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  // Keeps the button spinning until the draft room has actually rendered.
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = createDraftSchema.safeParse({ name, draftType, managerA, managerB });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    const params = new URLSearchParams({
      name: parsed.data.name,
      type: parsed.data.draftType,
      a: parsed.data.managerA,
      b: parsed.data.managerB,
    });
    startTransition(() => router.push(`/draft/play?${params.toString()}`));
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-lg">
      {/* draft type */}
      <fieldset className="space-y-sm">
        <legend className="font-display text-headline-md uppercase text-on-surface">
          Draft mode
        </legend>
        <div className="grid gap-sm md:grid-cols-3">
          {DRAFT_TYPES.map((type) => {
            const selected = draftType === type.id;
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => {
                  setDraftType(type.id);
                  setErrors((prev) => ({ ...prev, draftType: undefined }));
                }}
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
        {errors.draftType && <p className="font-sans text-sm text-error">{errors.draftType}</p>}
      </fieldset>

      {/* draft name */}
      <div className="space-y-xs">
        <label htmlFor="name" className="font-display text-headline-md uppercase text-on-surface">
          Draft name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          placeholder="e.g. The GOAT Showdown"
          maxLength={40}
        />
        {errors.name && <p className="font-sans text-sm text-error">{errors.name}</p>}
      </div>

      {/* managers */}
      <div className="grid gap-sm sm:grid-cols-2">
        <div className="space-y-xs">
          <label htmlFor="managerA" className="font-display text-headline-md uppercase text-on-surface">
            Manager 1
          </label>
          <Input
            id="managerA"
            value={managerA}
            onChange={(e) => {
              setManagerA(e.target.value);
              setErrors((prev) => ({ ...prev, managerA: undefined }));
            }}
            placeholder="Picks first"
            maxLength={20}
          />
          {errors.managerA && <p className="font-sans text-sm text-error">{errors.managerA}</p>}
        </div>
        <div className="space-y-xs">
          <label htmlFor="managerB" className="font-display text-headline-md uppercase text-on-surface">
            Manager 2
          </label>
          <Input
            id="managerB"
            value={managerB}
            onChange={(e) => {
              setManagerB(e.target.value);
              setErrors((prev) => ({ ...prev, managerB: undefined }));
            }}
            placeholder="Picks second"
            maxLength={20}
          />
          {errors.managerB && <p className="font-sans text-sm text-error">{errors.managerB}</p>}
        </div>
      </div>

      <HardButton type="submit" intent="primary" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? (
          <>
            <Loader2 className="animate-spin" /> Setting up…
          </>
        ) : (
          <>
            Start Draft <ArrowRight />
          </>
        )}
      </HardButton>
    </form>
  );
}
