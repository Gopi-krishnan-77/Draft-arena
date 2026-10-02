"use client";

import { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";

import { JerseyBadge } from "@/components/shared/JerseyBadge";
import type { Player } from "@/types/player";
import { PLAYERS } from "@/features/draft-room/players";
import { DRAFT_TYPE_MAP, isEligible } from "@/features/draft-room/draft-types";
import { useDraft, type DraftConfig } from "@/features/draft-room/useDraft";
import { allowedRoles, formationSlots } from "@/features/draft-room/formation";
import { CurrentPickBanner } from "@/features/draft-room/components/CurrentPickBanner";
import { PlayerSearch, type RoleFilter } from "@/features/draft-room/components/PlayerSearch";
import { AvailablePlayers } from "@/features/draft-room/components/AvailablePlayers";
import { FormationBar } from "@/features/draft-room/components/FormationBar";
import { FormationPitch } from "@/features/draft-room/components/FormationPitch";
import { TeamComparison } from "@/features/draft-room/components/TeamComparison";
import { DraftHistory } from "@/features/draft-room/components/DraftHistory";
import { DraftComplete } from "@/features/draft-room/components/DraftComplete";
import { RoomBoard } from "@/features/draft-room/components/RoomBoard";
import { TurnBar } from "@/features/draft-room/components/TurnBar";
import { useInView } from "@/features/draft-room/hooks/useInView";
import { teamStyle } from "@/features/draft-room/team-colors";
import { VerdictView } from "@/features/verdict/components/VerdictView";
import type { TeamInput } from "@/features/verdict/types";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

export function DraftRoom({ config }: { config: DraftConfig }) {
  const draft = useDraft(config);
  const meta = DRAFT_TYPE_MAP[config.draftType];

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [showVerdict, setShowVerdict] = useState(false);
  const [bannerRef, bannerInView] = useInView<HTMLDivElement>();

  const allowed = useMemo(
    () => (draft.currentTeam ? allowedRoles(draft.currentTeam.picks, draft.rosterSize) : new Set<Player["role"]>()),
    [draft.currentTeam, draft.rosterSize]
  );

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PLAYERS.filter((p) => {
      if (!isEligible(p, config.draftType)) return false;
      if (!allowed.has(p.role)) return false; // formation rules for the picking team
      if (draft.pickedIds[p.id]) return false;
      if (role !== "ALL" && p.role !== role) return false;
      if (q && !`${p.name} ${p.club ?? ""} ${p.nationality ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [draft.pickedIds, role, query, config.draftType, allowed]);

  const handleDraft = (player: Player) => {
    draft.pick(player);
    // jump back to an unfiltered view so the next manager sees the full board
    setQuery("");
    setRole("ALL");
  };

  return (
    <div className="space-y-md py-sm">
      {/* draft header */}
      <header className="flex flex-wrap items-center justify-between gap-sm">
        <div className="min-w-0">
          <h1 className="truncate font-display text-headline-lg-mobile font-black uppercase leading-none text-on-surface">
            {config.name}
          </h1>
          <div className="mt-1">
            <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
          </div>
        </div>
        {!draft.isComplete && (
          <button
            type="button"
            onClick={draft.reset}
            className="inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-on-surface-variant hover:text-primary"
          >
            <RotateCcw className="size-4" /> Reset
          </button>
        )}
      </header>

      {draft.isComplete ? (
        <DraftComplete
          teams={draft.teams}
          meta={meta}
          onReset={draft.reset}
          newDraftHref="/draft/create"
          onGetVerdict={() => setShowVerdict(true)}
        />
      ) : (
        <>
          <div ref={bannerRef}>
            <CurrentPickBanner
              slot={draft.slot!}
              currentTeamName={draft.currentTeam!.name}
              totalPicks={draft.totalPicks}
            />
          </div>
          <TurnBar
            visible={!bannerInView}
            teamName={draft.currentTeam!.name}
            position={draft.slot!.position}
            round={draft.slot!.round}
            pickNumber={draft.slot!.pickNumber}
            totalPicks={draft.totalPicks}
          />
        </>
      )}

      <RoomBoard
        mainLabel={draft.isComplete ? "Pitch" : `Players · ${available.length}`}
        historyCount={draft.history.length}
        main={
          draft.isComplete ? (
            <div className="space-y-md">
              <FormationPitch teamA={draft.teams[0]} teamB={draft.teams[1]} />
              {showVerdict && (
                <VerdictView
                  kind="hotseat"
                  draftType={config.draftType}
                  teams={
                    draft.teams.map((t) => ({
                      position: t.position,
                      name: t.name,
                      players: t.picks.map((p) => ({ name: p.name, role: p.role, rating: p.rating })),
                    })) as [TeamInput, TeamInput]
                  }
                />
              )}
            </div>
          ) : (
            <>
              <FormationBar
                slots={formationSlots(draft.currentTeam!.picks)}
                teamName={draft.currentTeam!.name}
              />
              <PlayerSearch
                query={query}
                onQueryChange={setQuery}
                role={role}
                onRoleChange={setRole}
                resultCount={available.length}
                allowedRoles={allowed}
              />
              <AvailablePlayers
                players={available}
                onDraft={handleDraft}
                actionLabel={`Draft · ${draft.currentTeam!.name}`}
                actionIntent={teamStyle(draft.slot!.position).intent}
              />
            </>
          )
        }
        squads={<TeamComparison teams={draft.teams} activePosition={draft.slot?.position ?? null} />}
        history={<DraftHistory history={draft.history} />}
      />
    </div>
  );
}
