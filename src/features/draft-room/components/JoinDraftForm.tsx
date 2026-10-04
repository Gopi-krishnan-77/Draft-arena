"use client";

import { useActionState } from "react";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { joinDraft, type ActionState } from "@/features/draft-room/actions";

interface Props {
  code: string;
  initialName: string;
}

export function JoinDraftForm({ code, initialName }: Props) {
  const [state, formAction] = useActionState<ActionState, FormData>(joinDraft, {});

  return (
    <form action={formAction} className="space-y-sm">
      <input type="hidden" name="code" value={code} />
      <div className="space-y-xs">
        <label htmlFor="displayName" className="font-display text-headline-md uppercase text-on-surface">
          Your manager name
        </label>
        <Input id="displayName" name="displayName" defaultValue={initialName} maxLength={20} autoFocus />
      </div>
      {state.error && (
        <p className="rounded-md border-2 border-error bg-error-container px-sm py-xs font-sans text-sm text-on-error-container">
          {state.error}
        </p>
      )}
      <SubmitButton intent="accent" size="lg" className="w-full" pendingLabel="Joining…">
        Join Draft
      </SubmitButton>
    </form>
  );
}
