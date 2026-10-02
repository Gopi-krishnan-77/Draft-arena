import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/env";
import { getUser } from "@/features/auth/user";
import { getRecentRoomsForUser } from "@/features/draft-room/queries";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import type { DraftStatusEnum } from "@/types/database";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

const STATUS_META: Record<DraftStatusEnum, { label: string; tone: "live" | "accent" | "outline"; cta: string }> = {
  LOBBY: { label: "In lobby", tone: "outline", cta: "Open lobby" },
  IN_PROGRESS: { label: "Live", tone: "live", cta: "Resume draft" },
  COMPLETED: { label: "Final", tone: "accent", cta: "View result" },
};

/** The signed-in user's latest drafts — jump back into a lobby, live board, or verdict. */
export async function RecentDrafts() {
  if (!isSupabaseConfigured()) return null;
  const user = await getUser();
  if (!user) return null;

  const rooms = await getRecentRoomsForUser(user.id);
  if (rooms.length === 0) return null;

  return (
    <section className="space-y-md">
      <div>
        <h2 className="font-display text-headline-lg-mobile font-black uppercase italic text-on-surface md:text-headline-lg">
          Your drafts
        </h2>
        <div className="mt-1 h-1 w-24 bg-tertiary-fixed" />
      </div>

      <div className="hide-scrollbar -mx-margin-mobile flex gap-sm overflow-x-auto px-margin-mobile pb-2 md:mx-0 md:px-0">
        {rooms.map((room) => {
          const meta = DRAFT_TYPE_MAP[room.draftType];
          const status = STATUS_META[room.status];
          return (
            <Link
              key={room.id}
              href={`/draft/${room.id}`}
              className="flex min-w-[240px] max-w-[280px] flex-col gap-xs rounded-xl border-2 border-ink bg-surface p-sm shadow-hard transition-all hover:-translate-y-0.5 active:translate-y-1 active:shadow-none"
            >
              <div className="flex items-center justify-between gap-2">
                <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
                <JerseyBadge tone={status.tone}>{status.label}</JerseyBadge>
              </div>
              <p className="truncate font-display text-headline-md uppercase text-on-surface">
                {room.name}
              </p>
              <p className="truncate font-sans text-xs text-on-surface-variant">
                {room.participantNames.length === 2
                  ? room.participantNames.join(" vs ")
                  : `${room.participantNames[0] ?? "?"} · waiting for opponent`}
              </p>
              <span className="mt-auto inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-primary">
                {status.cta} <ArrowRight className="size-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
