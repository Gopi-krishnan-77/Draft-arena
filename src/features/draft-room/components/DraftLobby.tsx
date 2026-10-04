"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, DoorOpen, Loader2, Trash2, UserRound, Hourglass } from "lucide-react";

import { cn } from "@/lib/utils";
import { HardButton } from "@/components/shared/HardButton";
import { JerseyBadge } from "@/components/shared/JerseyBadge";
import { DRAFT_TYPE_MAP } from "@/features/draft-room/draft-types";
import { startDraft, leaveDraft, cancelDraft } from "@/features/draft-room/actions";
import { useRealtimeRoom } from "@/features/draft-room/hooks/useRealtimeRoom";
import type { RoomState } from "@/features/draft-room/queries";

const TONE_MAP = { primary: "primary", secondary: "secondary", accent: "accent" } as const;

interface Props {
  roomState: RoomState;
  isHost: boolean;
  currentUserId: string;
}

export function DraftLobby({ roomState, isHost, currentUserId }: Props) {
  const router = useRouter();
  const { room, participants } = roomState;
  const meta = DRAFT_TYPE_MAP[room.draftType];
  const me = participants.find((p) => p.userId === currentUserId);

  // Live joins/starts via realtime (plus its built-in fallback refresh).
  const refresh = useCallback(() => router.refresh(), [router]);
  const { onlineUserIds, connected } = useRealtimeRoom({
    roomId: room.id,
    userId: currentUserId,
    displayName: me?.displayName ?? "Player",
    onChange: refresh,
  });

  const [joinUrl, setJoinUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [running, setRunning] = useState<"start" | "cancel" | "leave" | null>(null);

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/draft/join/${room.joinCode}`);
  }, [room.joinCode]);

  const full = participants.length >= 2;

  async function copy() {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy — select and copy the link manually.");
    }
  }

  function run(kind: "start" | "cancel" | "leave", action: () => Promise<{ error?: string }>) {
    setError(null);
    setRunning(kind);
    startTransition(async () => {
      const result = await action();
      if (result?.error) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-md py-md">
      <header className="space-y-xs">
        <JerseyBadge tone={TONE_MAP[meta.tone]}>{meta.label}</JerseyBadge>
        <h1 className="font-display-xl text-headline-lg-mobile font-black uppercase italic text-on-surface">
          {room.name}
        </h1>
        <p className="font-sans text-body-md text-on-surface-variant">
          Lobby · waiting for both managers
        </p>
      </header>

      {/* seats */}
      <div className="grid grid-cols-2 gap-sm">
        {[0, 1].map((pos) => {
          const seat = participants.find((p) => p.position === pos);
          const online = seat ? connected && onlineUserIds.includes(seat.userId) : false;
          return (
            <div
              key={pos}
              className={cn(
                "rounded-xl border-2 border-ink p-sm shadow-hard",
                seat ? "bg-surface" : "border-dashed bg-surface-container-low"
              )}
            >
              <p className="font-label-bold text-label-bold uppercase text-on-surface-variant">
                Manager {pos + 1}
              </p>
              {seat ? (
                <p className="mt-1 flex items-center gap-1 font-display text-headline-md uppercase text-on-surface">
                  <span className="relative">
                    <UserRound className="size-5 text-primary" />
                    {online && (
                      <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-ink bg-tertiary-fixed" />
                    )}
                  </span>
                  <span className="truncate">{seat.displayName}</span>
                  {seat.userId === currentUserId && (
                    <span className="font-sans text-xs text-on-surface-variant">(you)</span>
                  )}
                </p>
              ) : (
                <p className="mt-1 flex items-center gap-1 font-sans text-on-surface-variant">
                  <Hourglass className="size-4" /> Waiting…
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* invite */}
      <div className="space-y-xs rounded-xl border-2 border-ink bg-surface p-md shadow-hard">
        <p className="font-display text-headline-md uppercase text-on-surface">Invite your opponent</p>
        <div className="flex items-center gap-xs">
          <code className="min-w-0 flex-1 truncate rounded-md border-2 border-outline-variant bg-surface-container-low px-sm py-2 font-mono text-sm">
            {joinUrl || "…"}
          </code>
          <HardButton type="button" intent="dark" size="sm" onClick={copy}>
            {copied ? <Check /> : <Copy />}
            {copied ? "Copied" : "Copy"}
          </HardButton>
        </div>
        <p className="font-sans text-xs text-on-surface-variant">
          Code: <span className="font-stats-num text-on-surface">{room.joinCode}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-md border-2 border-error bg-error-container px-sm py-xs font-sans text-sm text-on-error-container">
          {error}
        </p>
      )}

      {isHost ? (
        <HardButton
          intent="primary"
          size="lg"
          disabled={!full || pending}
          onClick={() => run("start", () => startDraft(room.id))}
          className="w-full"
        >
          {pending && running === "start" ? (
            <>
              <Loader2 className="animate-spin" /> Starting…
            </>
          ) : full ? (
            "Start Draft"
          ) : (
            "Waiting for opponent…"
          )}
        </HardButton>
      ) : (
        <p className="rounded-xl border-2 border-ink bg-surface-container p-sm text-center font-display text-headline-md uppercase text-on-surface-variant">
          Waiting for the host to start…
        </p>
      )}

      {/* leave / cancel */}
      <div className="flex justify-center">
        {isHost ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("cancel", () => cancelDraft(room.id))}
            className="inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-error underline-offset-4 hover:underline disabled:opacity-50"
          >
            {pending && running === "cancel" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}{" "}
            Cancel draft
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => run("leave", () => leaveDraft(room.id))}
            className="inline-flex items-center gap-1 font-label-bold text-label-bold uppercase text-on-surface-variant underline-offset-4 hover:text-error hover:underline disabled:opacity-50"
          >
            {pending && running === "leave" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <DoorOpen className="size-4" />
            )}{" "}
            Leave lobby
          </button>
        )}
      </div>
    </div>
  );
}
