import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Swords, Zap } from "lucide-react";

import { SITE_URL } from "@/lib/env";
import { getUser } from "@/features/auth/user";
import { getRoomState } from "@/features/draft-room/queries";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import { teamStyle } from "@/features/draft-room/team-colors";
import { FormationPitch } from "@/features/draft-room/components/FormationPitch";
import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { VerdictView } from "@/features/verdict/components/VerdictView";
import { PublicVerdictView } from "@/features/verdict/components/PublicVerdictView";
import { featuredVerdict, getPublicVerdict } from "@/features/verdict/public";
import type { DraftTypeEnum } from "@/types/database";

// Viewer-dependent (managers can generate, visitors read) — never prerender.
export const dynamic = "force-dynamic";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

type Params = { params: Promise<{ roomId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { roomId } = await params;
  const data = await getPublicVerdict(roomId);
  if (!data) return { title: "AI Verdict — Draft Arena" };

  const [a, b] = data.teams;
  const featured = featuredVerdict(data.verdicts);
  const title = `${a.name} vs ${b.name} — ${data.room.name}`;
  const description = featured
    ? `“${featured.result.headline}” — see who the AI picked to win on Draft Arena.`
    : `Two all-time XIs, one winner. See both squads on Draft Arena.`;

  return {
    title: `${title} | Draft Arena`,
    description,
    openGraph: { title, description, type: "article", siteName: "Draft Arena" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function VerdictPage({ params }: Params) {
  const { roomId } = await params;
  const shareUrl = `${SITE_URL}/draft/${roomId}/verdict`;
  const [data, user] = await Promise.all([getPublicVerdict(roomId), getUser()]);

  if (!data) {
    // Not public (yet): unfinished draft, unknown id, or the 0006 RPC isn't
    // installed. Managers keep the original signed-in path; everyone else goes
    // through the room, which handles login / lobby / live / 404.
    if (user) {
      const state = await getRoomState(roomId);
      const isManager = state?.participants.some((p) => p.userId === user.id);
      if (state?.room.status === "COMPLETED" && isManager) {
        return (
          <ManagerView
            roomId={roomId}
            name={state.room.name}
            draftType={state.room.draftType}
            shareUrl={shareUrl}
          />
        );
      }
    }
    redirect(`/draft/${roomId}`);
  }

  if (data.isParticipant) {
    return (
      <ManagerView
        roomId={roomId}
        name={data.room.name}
        draftType={data.room.draftType}
        shareUrl={shareUrl}
        teamNames={[data.teams[0].name, data.teams[1].name]}
      />
    );
  }

  const meta = DRAFT_TYPE_MAP[data.room.draftType];
  const [teamA, teamB] = data.teams;

  return (
    <div className="mx-auto max-w-3xl space-y-lg py-md">
      <header className="space-y-xs">
        <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
        <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface md:text-headline-lg">
          {data.room.name}
        </h1>
        <Matchup names={[teamA.name, teamB.name]} />
      </header>

      <PublicVerdictView verdicts={data.verdicts} shareUrl={shareUrl} />

      <section className="space-y-sm">
        <h2 className="font-display text-headline-md uppercase text-on-surface">The two XIs</h2>
        <FormationPitch teamA={teamA} teamB={teamB} />
      </section>

      <ChallengeCta />
    </div>
  );
}

function Matchup({ names }: { names: [string, string] }) {
  return (
    <p className="flex flex-wrap items-center gap-xs font-display text-headline-md uppercase">
      <span className={teamStyle(0).text}>{names[0]}</span>
      <span className="font-sans text-sm normal-case text-on-surface-variant">vs</span>
      <span className={teamStyle(1).text}>{names[1]}</span>
    </p>
  );
}

/** The managers' own view: generate any mode on demand (unchanged behaviour). */
function ManagerView({
  roomId,
  name,
  draftType,
  shareUrl,
  teamNames,
}: {
  roomId: string;
  name: string;
  draftType: DraftTypeEnum;
  shareUrl: string;
  teamNames?: [string, string];
}) {
  const meta = DRAFT_TYPE_MAP[draftType];
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
            {name}
          </h1>
          <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
        </div>
        {teamNames && <Matchup names={teamNames} />}
      </header>

      <VerdictView kind="online" roomId={roomId} shareUrl={shareUrl} />
    </div>
  );
}

/** Turns a shared verdict into a new draft: the visitor's next step. */
function ChallengeCta() {
  return (
    <section className="space-y-sm rounded-xl border-2 border-ink bg-tertiary-fixed p-md text-on-tertiary-fixed shadow-hard">
      <p className="font-display-xl text-headline-lg-mobile font-black uppercase italic leading-none">
        Think you&apos;d draft better?
      </p>
      <p className="font-sans text-body-md">
        Pick your own all-time XI head-to-head against a friend, then let the AI settle it.
      </p>
      <div className="flex flex-col gap-sm sm:flex-row">
        <HardButton asChild intent="primary" size="lg">
          <Link href="/draft/new">
            <Swords /> Challenge a friend
          </Link>
        </HardButton>
        <HardButton asChild intent="outline" size="lg">
          <Link href="/draft/create">
            <Zap /> Quick play
          </Link>
        </HardButton>
      </div>
    </section>
  );
}
