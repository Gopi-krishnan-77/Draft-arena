"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wifi, WifiOff, Zap } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Player } from "@/types/player";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { HardButton } from "@/components/shared/HardButton";
import { DRAFT_TYPE_MAP, TURN_SECONDS } from "@/features/draft-room/draft-types";
import { currentSlot } from "@/features/draft-room/snake";
import { allowedRoles, formationSlots } from "@/features/draft-room/formation";
import type { TeamState, PickRecord } from "@/features/draft-room/useDraft";
import type { RoomState } from "@/features/draft-room/queries";
import { makePick, autoPick } from "@/features/draft-room/actions";
import { useRealtimeRoom } from "@/features/draft-room/hooks/useRealtimeRoom";
import { PickCountdown, useCountdown } from "@/features/draft-room/components/PickCountdown";
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

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;
/** Client fires auto-pick this long after the server deadline (skew cushion). */
const AUTO_PICK_GRACE_MS = 5_000;

interface Props {
  roomState: RoomState;
  players: Player[];
  currentUserId: string;
}

export function OnlineDraftRoom({ roomState, players, currentUserId }: Props) {
  const router = useRouter();
  const { room, participants, picks, pickedIds, turnStartedAt, serverNow } = roomState;
  const meta = DRAFT_TYPE_MAP[room.draftType];
  const totalPicks = room.rosterSize * 2;

  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("ALL");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const playerMap = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const pickedSet = useMemo(() => new Set(pickedIds), [pickedIds]);

  const teams = useMemo<[TeamState, TeamState]>(() => {
    const build = (pos: number): TeamState => {
      const part = participants.find((p) => p.position === pos);
      const teamPicks = picks
        .filter((pk) => pk.position === pos)
        .map((pk) => playerMap.get(pk.playerId))
        .filter((p): p is Player => Boolean(p));
      return { name: part?.displayName ?? `Manager ${pos + 1}`, position: pos, picks: teamPicks };
    };
    return [build(0), build(1)];
  }, [participants, picks, playerMap]);

  const history = useMemo<PickRecord[]>(() => {
    return picks
      .map((pk) => {
        const player = playerMap.get(pk.playerId);
        if (!player) return null;
        return {
          pickNumber: pk.pickNumber,
          round: pk.round,
          position: pk.position,
          player,
          managerName: teams[pk.position].name,
        } satisfies PickRecord;
      })
      .filter((r): r is PickRecord => r !== null);
  }, [picks, playerMap, teams]);

  const slot = currentSlot(picks.length, 2, room.rosterSize);
  const isComplete = slot === null || room.status === "COMPLETED";
  const me = participants.find((p) => p.userId === currentUserId);
  const myPosition = me?.position ?? -1;
  const isMyTurn = !isComplete && slot?.position === myPosition;
  const currentTeam = slot ? teams[slot.position] : null;

  // ── Realtime: DB changes + presence ─────────────────────────────
  const refresh = useCallback(() => router.refresh(), [router]);
  const { onlineUserIds, connected } = useRealtimeRoom({
    roomId: room.id,
    userId: currentUserId,
    displayName: me?.displayName ?? "Player",
    onChange: refresh,
  });

  const opponent = participants.find((p) => p.userId !== currentUserId);
  const opponentOnline =
    !isComplete && connected && participants.length === 2 && opponent
      ? onlineUserIds.includes(opponent.userId)
      : null;

  // ── Turn clock (server-anchored, skew-corrected) ────────────────
  const skewMs = useMemo(() => new Date(serverNow).getTime() - Date.now(), [serverNow]);
  const deadlineMs = useMemo(() => {
    if (isComplete || !turnStartedAt) return null;
    return new Date(turnStartedAt).getTime() + TURN_SECONDS * 1000 - skewMs;
  }, [isComplete, turnStartedAt, skewMs]);
  const remainingMs = useCountdown(deadlineMs);
  const expired = remainingMs !== null && remainingMs <= 0;

  // When the opponent's clock runs out (plus grace), force their auto-pick —
  // this is what keeps the draft alive if they stall or disconnect.
  //
  // The decision uses FRESH deadline math (deadlineMs is derived synchronously
  // from the latest turnStartedAt, Date.now() is live) — never the remainingMs
  // state, which can lag a render behind after a pick lands. remainingMs is in
  // the dep list purely as the tick that re-evaluates the effect. A 10s attempt
  // throttle (instead of a one-shot flag) means a transient network failure
  // retries instead of permanently disabling liveness for the turn; a
  // successful pick changes turnStartedAt, the fresh remaining goes positive,
  // and firing stops naturally.
  const lastAutoPickAt = useRef(0);
  useEffect(() => {
    if (isComplete || isMyTurn || deadlineMs === null) return;
    if (deadlineMs - Date.now() > -AUTO_PICK_GRACE_MS) return;
    if (Date.now() - lastAutoPickAt.current < 10_000) return;
    lastAutoPickAt.current = Date.now();
    autoPick(room.id)
      .then((res) => {
        if (res.error) setError(res.error);
        router.refresh();
      })
      .catch(() => {
        // Transient server-action failure — the throttle window will retry.
      });
  }, [remainingMs, deadlineMs, isMyTurn, isComplete, room.id, router]);

  function forceAutoPick() {
    setError(null);
    startTransition(async () => {
      const res = await autoPick(room.id);
      if (res.error) setError(res.error);
      router.refresh();
    });
  }

  // ── Formation rules for the picking team ────────────────────────
  const allowed = useMemo(
    () => (currentTeam ? allowedRoles(currentTeam.picks, room.rosterSize) : new Set<Player["role"]>()),
    [currentTeam, room.rosterSize]
  );

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((p) => {
      if (pickedSet.has(p.id)) return false;
      if (!allowed.has(p.role)) return false;
      if (role !== "ALL" && p.role !== role) return false;
      if (q && !`${p.name} ${p.club ?? ""} ${p.nationality ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [players, pickedSet, role, query, allowed]);

  function handleDraft(player: Player) {
    if (!isMyTurn || pending) return;
    setError(null);
    startTransition(async () => {
      const result = await makePick(room.id, player.id);
      if (result.error) setError(result.error);
      else {
        setQuery("");
        setRole("ALL");
        router.refresh();
      }
    });
  }

  const [bannerRef, bannerInView] = useInView<HTMLDivElement>();
  const myIntent = teamStyle(myPosition).intent;

  return (
    <div className="space-y-md py-sm">
      <header className="flex flex-wrap items-center justify-between gap-sm">
        <div className="min-w-0">
          <h1 className="truncate font-display text-headline-lg-mobile font-black uppercase leading-none text-on-surface">
            {room.name}
          </h1>
          <div className="mt-1 flex items-center gap-xs">
            <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
            {opponentOnline !== null && (
              <JerseyBadge tone={opponentOnline ? "accent" : "outline"}>
                {opponentOnline ? <Wifi className="size-3" /> : <WifiOff className="size-3" />}
                {opponentOnline ? "Opponent online" : "Opponent offline"}
              </JerseyBadge>
            )}
          </div>
        </div>
      </header>

      {isComplete ? (
        <DraftComplete teams={teams} meta={meta} verdictHref={`/draft/${room.id}/verdict`} />
      ) : (
        <>
          <div ref={bannerRef}>
            <CurrentPickBanner
              slot={slot!}
              currentTeamName={currentTeam!.name}
              totalPicks={totalPicks}
              timer={remainingMs !== null ? <PickCountdown remainingMs={remainingMs} /> : undefined}
            />
          </div>
          <TurnBar
            visible={!bannerInView}
            teamName={isMyTurn ? "You" : currentTeam!.name}
            position={slot!.position}
            round={slot!.round}
            pickNumber={slot!.pickNumber}
            totalPicks={totalPicks}
            secondsLeft={remainingMs !== null ? Math.ceil(remainingMs / 1000) : null}
            note={isMyTurn ? "Your pick" : "Waiting"}
          />

          {opponentOnline === false && (
            <div className="rounded-md border-2 border-ink bg-secondary-fixed px-sm py-xs font-sans text-sm text-on-secondary-fixed">
              Your opponent disconnected. If their clock hits zero, their pick is auto-drafted and
              the draft keeps moving.
            </div>
          )}

          <div
            className={cn(
              "flex flex-wrap items-center justify-center gap-sm rounded-md border-2 border-ink px-sm py-2 text-center font-display text-headline-md uppercase",
              isMyTurn
                ? expired
                  ? "bg-secondary-container text-on-secondary-container"
                  : "bg-tertiary-fixed text-on-tertiary-fixed"
                : "bg-surface-container text-on-surface-variant"
            )}
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" /> Working…
              </span>
            ) : isMyTurn ? (
              expired ? (
                "Time's up — pick now before the system picks for you!"
              ) : (
                "You're on the clock — make your pick"
              )
            ) : expired ? (
              <>
                <span>{currentTeam!.name}&apos;s time is up</span>
                <HardButton type="button" intent="secondary" size="sm" onClick={forceAutoPick}>
                  <Zap /> Force auto-pick
                </HardButton>
              </>
            ) : (
              `Waiting for ${currentTeam!.name} to pick…`
            )}
          </div>
        </>
      )}

      {error && (
        <p className="rounded-md border-2 border-error bg-error-container px-sm py-xs font-sans text-sm text-on-error-container">
          {error}
        </p>
      )}

      <RoomBoard
        mainLabel={isComplete ? "Pitch" : `Players · ${available.length}`}
        historyCount={history.length}
        main={
          isComplete ? (
            <FormationPitch teamA={teams[0]} teamB={teams[1]} />
          ) : (
            <>
              {currentTeam && (
                <FormationBar slots={formationSlots(currentTeam.picks)} teamName={currentTeam.name} />
              )}
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
                disabled={!isMyTurn || pending}
                actionLabel={isMyTurn ? "Draft" : `${currentTeam?.name ?? "Opponent"}'s pick`}
                actionIntent={myIntent}
              />
            </>
          )
        }
        squads={<TeamComparison teams={teams} activePosition={slot?.position ?? null} />}
        history={<DraftHistory history={history} />}
      />
    </div>
  );
}
