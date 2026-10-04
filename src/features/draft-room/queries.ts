import type { DraftCategoryTag, Player } from "@/types/player";
import type { DraftStatusEnum, DraftTypeEnum, Json } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { isEligible, type DraftType } from "@/features/draft-room/draft-types";

export interface RoomParticipant {
  id: string;
  userId: string;
  displayName: string;
  position: number;
}

export interface RoomPick {
  pickNumber: number;
  round: number;
  position: number;
  participantId: string;
  playerId: string;
}

export interface RoomState {
  room: {
    id: string;
    name: string;
    draftType: DraftTypeEnum;
    status: DraftStatusEnum;
    rosterSize: number;
    joinCode: string;
    createdBy: string;
    startedAt: string | null;
  };
  participants: RoomParticipant[];
  picks: RoomPick[];
  pickedIds: string[];
  /** When the current turn's clock started: last pick, else draft start. */
  turnStartedAt: string | null;
  /** Server clock at query time — lets clients correct for local clock skew. */
  serverNow: string;
}

function rowToPlayer(row: {
  id: string;
  name: string;
  role: Player["role"];
  rating: number;
  metadata: Json;
}): Player {
  const meta = (row.metadata ?? {}) as {
    club?: string;
    nationality?: string;
    era?: string;
    imageUrl?: string;
    categories?: DraftCategoryTag[];
  };
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    rating: row.rating,
    club: meta.club,
    nationality: meta.nationality,
    era: meta.era,
    imageUrl: meta.imageUrl,
    categories: meta.categories ?? [],
  };
}

/** The draftable pool for a draft type (best-rated first). */
export async function getPlayers(draftType: DraftType): Promise<Player[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("players")
    .select("id,name,role,rating,metadata")
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToPlayer).filter((p) => isEligible(p, draftType));
}

export async function getRoomByCode(code: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("draft_rooms")
    .select("*")
    .eq("join_code", code)
    .maybeSingle();
  return data;
}

/** Everything needed to render a room: room + participants + picks. */
export async function getRoomState(roomId: string): Promise<RoomState | null> {
  const supabase = await createClient();

  // Independent reads — fetch in parallel rather than three sequential round trips.
  const [{ data: room }, { data: partRows }, { data: pickRows }] = await Promise.all([
    supabase.from("draft_rooms").select("*").eq("id", roomId).maybeSingle(),
    supabase
      .from("draft_participants")
      .select("id,user_id,display_name,draft_position")
      .eq("room_id", roomId)
      .order("draft_position"),
    supabase
      .from("draft_picks")
      .select("pick_number,round,participant_id,player_id,created_at")
      .eq("room_id", roomId)
      .order("pick_number"),
  ]);
  if (!room) return null;

  const participants: RoomParticipant[] = (partRows ?? []).map((p) => ({
    id: p.id,
    userId: p.user_id,
    displayName: p.display_name,
    position: p.draft_position,
  }));

  const positionFor = new Map(participants.map((p) => [p.id, p.position]));
  const picks: RoomPick[] = (pickRows ?? []).map((pk) => ({
    pickNumber: pk.pick_number,
    round: pk.round,
    position: positionFor.get(pk.participant_id) ?? 0,
    participantId: pk.participant_id,
    playerId: pk.player_id,
  }));

  const lastPickAt = (pickRows ?? []).reduce<string | null>(
    (latest, pk) => (!latest || pk.created_at > latest ? pk.created_at : latest),
    null
  );

  return {
    room: {
      id: room.id,
      name: room.name,
      draftType: room.draft_type,
      status: room.status,
      rosterSize: room.roster_size,
      joinCode: room.join_code,
      createdBy: room.created_by,
      startedAt: room.started_at,
    },
    participants,
    picks,
    pickedIds: picks.map((p) => p.playerId),
    turnStartedAt: lastPickAt ?? room.started_at,
    serverNow: new Date().toISOString(),
  };
}

export interface RecentRoom {
  id: string;
  name: string;
  draftType: DraftTypeEnum;
  status: DraftStatusEnum;
  createdAt: string;
  participantNames: string[];
}

/** The user's latest drafts (as creator or joiner), newest first. */
export async function getRecentRoomsForUser(userId: string, limit = 6): Promise<RecentRoom[]> {
  const supabase = await createClient();

  const { data: myRows } = await supabase
    .from("draft_participants")
    .select("room_id")
    .eq("user_id", userId);
  const roomIds = (myRows ?? []).map((r) => r.room_id);
  if (roomIds.length === 0) return [];

  const { data: rooms } = await supabase
    .from("draft_rooms")
    .select("id,name,draft_type,status,created_at")
    .in("id", roomIds)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (!rooms || rooms.length === 0) return [];

  const { data: parts } = await supabase
    .from("draft_participants")
    .select("room_id,display_name,draft_position")
    .in("room_id", rooms.map((r) => r.id))
    .order("draft_position");

  return rooms.map((r) => ({
    id: r.id,
    name: r.name,
    draftType: r.draft_type,
    status: r.status,
    createdAt: r.created_at,
    participantNames: (parts ?? []).filter((p) => p.room_id === r.id).map((p) => p.display_name),
  }));
}
