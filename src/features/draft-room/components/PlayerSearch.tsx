import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import type { PlayerRole } from "@/types/player";

export type RoleFilter = PlayerRole | "ALL";

const ROLES: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "GK", label: "GK" },
  { value: "DEF", label: "DEF" },
  { value: "MID", label: "MID" },
  { value: "FWD", label: "FWD" },
];

interface PlayerSearchProps {
  query: string;
  onQueryChange: (value: string) => void;
  role: RoleFilter;
  onRoleChange: (role: RoleFilter) => void;
  resultCount: number;
  /** Positions the picking team may still draft. Others are shown locked. */
  allowedRoles?: Set<PlayerRole>;
}

export function PlayerSearch({
  query,
  onQueryChange,
  role,
  onRoleChange,
  resultCount,
  allowedRoles,
}: PlayerSearchProps) {
  return (
    <div className="space-y-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-on-surface-variant" />
        <Input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search players, clubs, nations…"
          className="pl-10"
          aria-label="Search players"
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-xs">
        <div className="flex flex-wrap gap-xs">
          {ROLES.map(({ value, label }) => {
            const locked =
              value !== "ALL" && allowedRoles !== undefined && !allowedRoles.has(value);
            return (
              <button
                key={value}
                type="button"
                disabled={locked}
                onClick={() => onRoleChange(value)}
                className="transition-transform active:scale-95 disabled:cursor-not-allowed"
                aria-pressed={role === value}
              >
                <JerseyBadge
                  tone={role === value ? "primary" : "outline"}
                  className={cn(role !== value && "opacity-70", locked && "opacity-30 line-through")}
                >
                  {label}
                </JerseyBadge>
              </button>
            );
          })}
        </div>
        <span className="font-label-bold text-label-bold uppercase text-on-surface-variant">
          {resultCount} available
        </span>
      </div>
    </div>
  );
}
