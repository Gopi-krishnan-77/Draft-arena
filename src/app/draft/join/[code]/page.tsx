import Link from "next/link";
import { redirect } from "next/navigation";

import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { requireUser, displayNameFor } from "@/features/auth/user";
import { getRoomByCode, getRoomState } from "@/features/draft-room/queries";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import { JoinDraftForm } from "@/features/draft-room/components/JoinDraftForm";

// Depends on the authenticated user — never prerender.
export const dynamic = "force-dynamic";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-md space-y-md py-xl">{children}</div>;
}

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await requireUser(`/draft/join/${code}`);

  const room = await getRoomByCode(code);
  if (!room) {
    return (
      <Shell>
        <div className="rounded-xl border-2 border-ink bg-surface p-md text-center shadow-hard">
          <h1 className="font-display text-headline-md uppercase text-on-surface">Draft not found</h1>
          <p className="mt-xs font-sans text-on-surface-variant">
            The code <span className="font-stats-num">{code}</span> doesn&apos;t match any draft.
          </p>
          <div className="mt-sm flex justify-center">
            <HardButton asChild intent="outline" size="sm">
              <Link href="/">Back home</Link>
            </HardButton>
          </div>
        </div>
      </Shell>
    );
  }

  const state = await getRoomState(room.id);
  const alreadyIn = state?.participants.some((p) => p.userId === user.id);
  if (alreadyIn) redirect(`/draft/${room.id}`);

  const meta = DRAFT_TYPE_MAP[room.draft_type];

  if ((state?.participants.length ?? 0) >= 2) {
    return (
      <Shell>
        <div className="rounded-xl border-2 border-ink bg-surface p-md text-center shadow-hard">
          <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
          <h1 className="mt-xs font-display text-headline-md uppercase text-on-surface">
            “{room.name}” is full
          </h1>
          <p className="mt-xs font-sans text-on-surface-variant">
            This draft already has two managers.
          </p>
          <div className="mt-sm flex justify-center">
            <HardButton asChild intent="primary" size="sm">
              <Link href="/draft/new">Start your own</Link>
            </HardButton>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-xs text-center">
        <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
        <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface">
          Join “{room.name}”
        </h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          You&apos;re Manager 2. Lock in your name and get ready to draft.
        </p>
      </div>
      <div className="rounded-xl border-2 border-ink bg-surface p-md shadow-hard">
        <JoinDraftForm code={code} initialName={displayNameFor(user)} />
      </div>
    </Shell>
  );
}
