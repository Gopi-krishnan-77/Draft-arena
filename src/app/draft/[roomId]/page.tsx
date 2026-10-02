import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/features/auth/user";
import { getRoomState, getPlayers } from "@/features/draft-room/queries";
import { DraftLobby } from "@/features/draft-room/components/DraftLobby";
import { OnlineDraftRoom } from "@/features/draft-room/components/OnlineDraftRoom";

// Depends on the authenticated user and live room state — never prerender.
export const dynamic = "force-dynamic";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const user = await requireUser(`/draft/${roomId}`);

  const state = await getRoomState(roomId);
  if (!state) notFound();

  const me = state.participants.find((p) => p.userId === user.id);
  if (!me) {
    // Not in this draft yet — route through the join flow (handles full/space).
    redirect(`/draft/join/${state.room.joinCode}`);
  }

  if (state.room.status === "LOBBY") {
    return (
      <DraftLobby
        roomState={state}
        isHost={state.room.createdBy === user.id}
        currentUserId={user.id}
      />
    );
  }

  const players = await getPlayers(state.room.draftType);
  return <OnlineDraftRoom roomState={state} players={players} currentUserId={user.id} />;
}
