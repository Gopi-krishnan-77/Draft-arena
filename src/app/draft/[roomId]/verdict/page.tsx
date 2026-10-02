import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SITE_URL } from "@/lib/env";
import { requireUser } from "@/features/auth/user";
import { getRoomState } from "@/features/draft-room/queries";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { VerdictView } from "@/features/verdict/components/VerdictView";

// Depends on the authenticated user and live room state — never prerender.
export const dynamic = "force-dynamic";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

export default async function VerdictPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  await requireUser(`/draft/${roomId}/verdict`);

  const state = await getRoomState(roomId);
  if (!state) notFound();
  if (state.room.status !== "COMPLETED") redirect(`/draft/${roomId}`);

  const meta = DRAFT_TYPE_MAP[state.room.draftType];
  const shareUrl = `${SITE_URL}/draft/${roomId}/verdict`;

  return (
    <div className="mx-auto max-w-3xl space-y-md py-md">
      <header className="space-y-xs">
        <Link
          href={`/draft/${roomId}`}
          className="inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="size-4" /> Back to draft
        </Link>
        <div className="flex flex-wrap items-center gap-sm">
          <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface">
            {state.room.name}
          </h1>
          <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
        </div>
      </header>

      <VerdictView kind="online" roomId={roomId} shareUrl={shareUrl} />
    </div>
  );
}
