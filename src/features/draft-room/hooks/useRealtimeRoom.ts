"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

interface Options {
  roomId: string;
  /** Presence key — the current user's id. */
  userId: string;
  displayName: string;
  /** Called on any room change (pick made, participant joined, status flipped). */
  onChange: () => void;
  enabled?: boolean;
}

export interface RealtimeRoomState {
  /** User ids currently connected to this room (includes self once subscribed). */
  onlineUserIds: string[];
  /** True once the realtime channel is live. */
  connected: boolean;
}

/**
 * Live wiring for a draft room: Postgres change events (picks / room / joins)
 * plus presence (who's actually here). A slow 20s refresh remains as a safety
 * net in case the websocket drops silently.
 */
export function useRealtimeRoom({
  roomId,
  userId,
  displayName,
  onChange,
  enabled = true,
}: Options): RealtimeRoomState {
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);

  // Keep the latest callback without resubscribing the channel.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) return;

    const supabase = createClient();
    let disposed = false;

    const channel = supabase.channel(`room:${roomId}`, {
      config: { presence: { key: userId } },
    });

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "draft_picks", filter: `room_id=eq.${roomId}` },
        () => onChangeRef.current()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draft_rooms", filter: `id=eq.${roomId}` },
        () => onChangeRef.current()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "draft_participants", filter: `room_id=eq.${roomId}` },
        () => onChangeRef.current()
      )
      .on("presence", { event: "sync" }, () => {
        if (!disposed) setOnlineUserIds(Object.keys(channel.presenceState()));
      });

    // Prime the client's auth session so RLS-gated change events are delivered,
    // then subscribe and announce ourselves.
    supabase.auth.getSession().then(() => {
      if (disposed) return;
      channel.subscribe(async (status) => {
        if (disposed) return;
        if (status === "SUBSCRIBED") {
          setConnected(true);
          await channel.track({ name: displayName, joined_at: new Date().toISOString() });
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          setConnected(false);
        }
      });
    });

    // Safety net: realtime websockets can die quietly (sleep, network blips).
    const fallback = setInterval(() => onChangeRef.current(), 20_000);

    return () => {
      disposed = true;
      clearInterval(fallback);
      supabase.removeChannel(channel);
    };
  }, [roomId, userId, displayName, enabled]);

  return { onlineUserIds, connected };
}
