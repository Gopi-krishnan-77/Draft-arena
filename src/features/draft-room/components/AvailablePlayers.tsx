import { SearchX } from "lucide-react";

import { PlayerCard } from "@/components/shared/PlayerCard";
import type { Player } from "@/types/player";

interface AvailablePlayersProps {
  players: Player[];
  onDraft: (player: Player) => void;
  disabled?: boolean;
  /** Button label, e.g. "Draft for Gopi" — makes whose pick it is unmistakable. */
  actionLabel?: string;
  /** Button colour = the picking manager's team colour. */
  actionIntent?: "primary" | "secondary";
}

export function AvailablePlayers({
  players,
  onDraft,
  disabled = false,
  actionLabel = "Draft",
  actionIntent = "primary",
}: AvailablePlayersProps) {
  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-xs rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low p-xl text-center">
        <SearchX className="size-8 text-on-surface-variant" />
        <p className="font-display text-headline-md uppercase text-on-surface">No players found</p>
        <p className="font-sans text-sm text-on-surface-variant">
          Try a different search or position filter.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 xl:grid-cols-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onDraft={onDraft}
          disabled={disabled}
          actionLabel={actionLabel}
          actionIntent={actionIntent}
        />
      ))}
    </div>
  );
}
