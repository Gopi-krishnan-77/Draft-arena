"use client";

import { useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { EXPORT_EXCLUDE, SaveImageButton } from "@/components/shared/SaveImageButton";
import type { Player, PlayerRole } from "@/types/player";
import type { TeamState } from "@/features/draft-room/useDraft";
import { ROLE_ORDER } from "@/features/draft-room/formation";
import { lastName } from "@/features/draft-room/team-colors";

type Side = "a" | "b";


/** Fixed slot lines (from the drafted composition) + the swappable player order. */
function buildLayout(team: TeamState) {
  const lines: PlayerRole[] = [];
  const players: Player[] = [];
  for (const role of ROLE_ORDER) {
    for (const p of team.picks.filter((pl) => pl.role === role)) {
      lines.push(role);
      players.push(p);
    }
  }
  return { lines, players };
}

function avgOf(team: TeamState) {
  return team.picks.length
    ? Math.round(team.picks.reduce((s, p) => s + p.rating, 0) / team.picks.length)
    : 0;
}

function Token({
  player,
  side,
  selected,
  onClick,
}: {
  player: Player;
  side: Side;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-[3.75rem] flex-col items-center gap-0.5 transition-transform active:scale-95 sm:w-20"
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full border-2 border-ink font-stats-num text-sm shadow-hard-sm sm:size-11",
          side === "a"
            ? "bg-primary text-on-primary"
            : "bg-secondary-container text-on-secondary-container",
          selected && "ring-4 ring-tertiary-fixed"
        )}
      >
        {player.rating}
      </span>
      <span className="flex max-w-full items-center gap-0.5">
        <span
          className="truncate text-center font-label-bold text-[10px] uppercase leading-tight text-surface"
          title={player.name}
        >
          {lastName(player.name)}
        </span>
      </span>
      <span className="font-label-bold text-[9px] uppercase text-surface/60">{player.role}</span>
    </button>
  );
}

function Half({
  players,
  lines,
  side,
  lineOrder,
  selectedIndex,
  onPick,
}: {
  players: Player[];
  lines: PlayerRole[];
  side: Side;
  lineOrder: PlayerRole[];
  selectedIndex: number | null;
  onPick: (index: number) => void;
}) {
  const grouped = useMemo(() => {
    const map: Record<PlayerRole, { player: Player; index: number }[]> = {
      GK: [],
      DEF: [],
      MID: [],
      FWD: [],
    };
    players.forEach((p, i) => map[lines[i]].push({ player: p, index: i }));
    return map;
  }, [players, lines]);

  return (
    <div className="flex flex-1 flex-col justify-around gap-2 py-2">
      {lineOrder.map((role) => (
        <div key={role} className="flex items-center justify-around gap-1">
          {grouped[role].map(({ player, index }) => (
            <Token
              key={player.id}
              player={player}
              side={side}
              selected={selectedIndex === index}
              onClick={() => onPick(index)}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function TeamTag({ team, side }: { team: TeamState; side: Side }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "inline-flex items-center rounded-sm border-2 border-ink px-xs py-0.5 font-display text-headline-md uppercase",
          side === "a"
            ? "bg-primary text-on-primary"
            : "bg-secondary-container text-on-secondary-container"
        )}
      >
        {team.name}
      </span>
      <span className="font-stats-num text-stats-num text-surface">AVG {avgOf(team)}</span>
    </div>
  );
}

const idSig = (players: Player[]) => players.map((p) => p.id).join("|");
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "team";
const excludeFromExport = { [EXPORT_EXCLUDE]: "" };

export function FormationPitch({ teamA, teamB }: { teamA: TeamState; teamB: TeamState }) {
  const layoutA = useMemo(() => buildLayout(teamA), [teamA]);
  const layoutB = useMemo(() => buildLayout(teamB), [teamB]);

  const [orderA, setOrderA] = useState(layoutA.players);
  const [orderB, setOrderB] = useState(layoutB.players);
  const [selected, setSelected] = useState<{ side: Side; index: number } | null>(null);
  const pitchRef = useRef<HTMLElement | null>(null);

  // Online rooms re-render with fresh (new-identity) team arrays on every
  // realtime/fallback refresh. Only resync the swap state when the actual
  // roster CONTENT changes — same ids means the user's swaps survive.
  const sig = `${idSig(layoutA.players)}::${idSig(layoutB.players)}`;
  const [syncedSig, setSyncedSig] = useState(sig);
  if (syncedSig !== sig) {
    setSyncedSig(sig);
    setOrderA(layoutA.players);
    setOrderB(layoutB.players);
    setSelected(null);
  }

  function pick(side: Side, index: number) {
    if (!selected) {
      setSelected({ side, index });
      return;
    }
    if (selected.side !== side) {
      // Can't swap across teams — move the selection to the new player instead.
      setSelected({ side, index });
      return;
    }
    if (selected.index === index) {
      setSelected(null);
      return;
    }
    const i = selected.index;
    const apply = (arr: Player[]) => {
      const next = [...arr];
      [next[i], next[index]] = [next[index], next[i]];
      return next;
    };
    if (side === "a") setOrderA(apply);
    else setOrderB(apply);
    setSelected(null);
  }

  function reset() {
    setOrderA(layoutA.players);
    setOrderB(layoutB.players);
    setSelected(null);
  }

  // Content comparison (not reference) — refreshed props with identical
  // rosters must not fake a "changed" state.
  const dirty = idSig(orderA) !== idSig(layoutA.players) || idSig(orderB) !== idSig(layoutB.players);

  return (
    <div className="space-y-sm">
      <section
        ref={pitchRef}
        className="rounded-xl border-2 border-ink bg-gradient-to-b from-[#0d4a25] via-[#11633180] to-[#0d4a25] p-sm shadow-hard"
      >
        {/* swap hint + reset are UI-only — left out of the saved image */}
        <div className="mb-2 flex items-center justify-between gap-2" {...excludeFromExport}>
          <p className="font-sans text-xs text-surface/80">
            Tap a player, then tap another on the same team to swap.
          </p>
          {dirty && (
            <button
              type="button"
              onClick={reset}
              className="inline-flex shrink-0 items-center gap-1 font-label-bold text-label-bold uppercase text-surface/80 hover:text-surface"
            >
              <RotateCcw className="size-3" /> Reset
            </button>
          )}
        </div>

        <TeamTag team={teamA} side="a" />

        <div className="relative my-2 overflow-hidden rounded-md border-2 border-ink/40 bg-[#0f5a2e]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-surface/40" />
            <div className="absolute left-1/2 top-1/2 size-20 -translate-x-1/2 -translate-y-1/2 rounded-full border border-surface/40" />
            <div className="absolute left-1/2 top-0 h-12 w-24 -translate-x-1/2 border-x border-b border-surface/30" />
            <div className="absolute bottom-0 left-1/2 h-12 w-24 -translate-x-1/2 border-x border-t border-surface/30" />
          </div>

          <div className="relative flex min-h-[460px] flex-col sm:min-h-[520px]">
            <Half
              players={orderA}
              lines={layoutA.lines}
              side="a"
              lineOrder={["GK", "DEF", "MID", "FWD"]}
              selectedIndex={selected?.side === "a" ? selected.index : null}
              onPick={(i) => pick("a", i)}
            />
            <Half
              players={orderB}
              lines={layoutB.lines}
              side="b"
              lineOrder={["FWD", "MID", "DEF", "GK"]}
              selectedIndex={selected?.side === "b" ? selected.index : null}
              onPick={(i) => pick("b", i)}
            />
          </div>
        </div>

        <TeamTag team={teamB} side="b" />

        <p className="mt-2 text-center font-display text-label-bold uppercase tracking-widest text-surface/50">
          Draft Arena
        </p>
      </section>

      <div className="flex justify-center">
        <SaveImageButton
          targetRef={pitchRef}
          label="Save XI as image"
          shareTitle={`${teamA.name} vs ${teamB.name} — Draft Arena`}
          fileName={`${slug(teamA.name)}-vs-${slug(teamB.name)}-draft-arena.png`}
          onBeforeCapture={() => setSelected(null)}
        />
      </div>
    </div>
  );
}
