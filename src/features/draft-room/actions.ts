"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/features/auth/user";
import { ROSTER_SIZE } from "@/features/draft-room/draft-types";
import { createOnlineDraftSchema, joinDraftSchema } from "@/features/draft-room/schema";
import { generateJoinCode } from "@/features/draft-room/join-code";

export interface ActionState {
  error?: string;
}

const UNIQUE_VIOLATION = "23505";

/** Create a persisted room, add the creator as Manager 1, go to the room. */
export async function createDraft(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/draft/new");

  const parsed = createOnlineDraftSchema.safeParse({
    name: formData.get("name"),
    draftType: formData.get("draftType"),
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const supabase = await createClient();

  // Insert the room, retrying on the rare join_code collision.
  let roomId: string | null = null;
  for (let attempt = 0; attempt < 5 && !roomId; attempt += 1) {
    const { data, error } = await supabase
      .from("draft_rooms")
      .insert({
        name: parsed.data.name,
        draft_type: parsed.data.draftType,
        join_code: generateJoinCode(),
        created_by: user.id,
        roster_size: ROSTER_SIZE,
      })
      .select("id")
      .single();

    if (!error && data) {
      roomId = data.id;
    } else if (error && error.code !== UNIQUE_VIOLATION) {
      return { error: "Could not create the draft. Please try again." };
    }
  }
  if (!roomId) return { error: "Could not create the draft. Please try again." };

  const { error: participantError } = await supabase.from("draft_participants").insert({
    room_id: roomId,
    user_id: user.id,
    display_name: parsed.data.displayName,
    draft_position: 0,
  });
  if (participantError) return { error: "Could not set up your team. Please try again." };

  redirect(`/draft/${roomId}`);
}

/** Join an existing room as Manager 2 (the open seat). */
export async function joinDraft(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = joinDraftSchema.safeParse({
    code: formData.get("code"),
    displayName: formData.get("displayName"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }
  const { code, displayName } = parsed.data;

  const user = await requireUser(`/draft/join/${code}`);
  const supabase = await createClient();

  const { data: room } = await supabase
    .from("draft_rooms")
    .select("id")
    .eq("join_code", code)
    .maybeSingle();
  if (!room) return { error: "That draft code doesn't exist." };

  const { data: existing } = await supabase
    .from("draft_participants")
    .select("user_id,draft_position")
    .eq("room_id", room.id);
  const seats = existing ?? [];

  if (seats.some((s) => s.user_id === user.id)) {
    redirect(`/draft/${room.id}`); // already in this draft
  }
  if (seats.length >= 2) return { error: "This draft is already full." };

  const position = seats.some((s) => s.draft_position === 0) ? 1 : 0;
  const { error } = await supabase.from("draft_participants").insert({
    room_id: room.id,
    user_id: user.id,
    display_name: displayName,
    draft_position: position,
  });
  if (error) return { error: "Could not join — the draft may have just filled up." };

  redirect(`/draft/${room.id}`);
}

/**
 * Host-only: move a full lobby into the drafting phase. Runs through the
 * start_draft() RPC, which locks the room row and re-checks the participant
 * count — so a guest leaving at the same instant can never race a start.
 */
export async function startDraft(roomId: string): Promise<ActionState> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("start_draft", { p_room_id: roomId });

  if (error) {
    const message = error.message ?? "";
    const friendly = message.includes("Only the host")
      ? "Only the host can start the draft."
      : message.includes("already started")
        ? "This draft has already started."
        : message.includes("Waiting for opponent")
          ? "Waiting for a second manager to join."
          : message.includes("not found")
            ? "Draft not found."
            : "Could not start the draft. Please try again.";
    return { error: friendly };
  }

  revalidatePath(`/draft/${roomId}`);
  return {};
}

/** Make a pick through the atomic make_pick() RPC (turn + duplicate enforced in Postgres). */
export async function makePick(roomId: string, playerId: string): Promise<ActionState> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("make_pick", {
    p_room_id: roomId,
    p_player_id: playerId,
  });

  if (error) {
    const message = error.message ?? "";
    const friendly = message.includes("Not your turn")
      ? "It's not your turn."
      : message.includes("complete")
        ? "The draft is already complete."
        : message.includes("not in this draft")
          ? "You're not in this draft."
          : message.includes("not active")
            ? "This draft isn't active."
            : message.includes("Position limit")
              ? "Your XI can't fit another player in that position."
              : message.includes("not eligible")
                ? "That player isn't eligible for this draft type."
                : error.code === UNIQUE_VIOLATION
                  ? "That player was just taken."
                  : "Could not make that pick. Please try again.";
    return { error: friendly };
  }

  revalidatePath(`/draft/${roomId}`);
  return {};
}

/**
 * Force the on-the-clock manager's pick once their 60s expire (auto-drafts the
 * best eligible player). Any participant may trigger it — this is what keeps a
 * draft moving when the opponent stalls or disconnects.
 */
export async function autoPick(roomId: string): Promise<ActionState> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("auto_pick", { p_room_id: roomId });

  if (error) {
    const message = error.message ?? "";
    // "not expired" races are normal (a pick landed just in time) — refetch quietly.
    const friendly = message.includes("not expired")
      ? undefined
      : message.includes("complete")
        ? "The draft is already complete."
        : message.includes("not active")
          ? "This draft isn't active."
          : message.includes("timer unavailable") || message.includes("Timer unavailable")
            ? "The turn timer isn't available for this draft."
            : "Could not auto-pick. Please try again.";
    revalidatePath(`/draft/${roomId}`);
    return friendly ? { error: friendly } : {};
  }

  revalidatePath(`/draft/${roomId}`);
  return {};
}

/**
 * Leave a lobby you joined (not the host). Runs through the leave_room() RPC,
 * which locks the room row — so it can't race the host's start and silently
 * strand you inside a live draft.
 */
export async function leaveDraft(roomId: string): Promise<ActionState> {
  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.rpc("leave_room", { p_room_id: roomId });

  if (error) {
    const message = error.message ?? "";
    const friendly = message.includes("already started")
      ? "The draft already started — you can't leave now. Your picks auto-draft if you stall."
      : message.includes("Host must cancel")
        ? "As the host, cancel the draft instead of leaving."
        : "Could not leave the draft.";
    return { error: friendly };
  }

  redirect("/");
}

/** Host cancels a lobby that hasn't started. Cascades participants. */
export async function cancelDraft(roomId: string): Promise<ActionState> {
  const user = await requireUser();
  const supabase = await createClient();

  // .select() so a 0-row delete (draft started in the same instant — RLS
  // filters it out) is reported as a failure instead of a silent no-op.
  const { data, error } = await supabase
    .from("draft_rooms")
    .delete()
    .eq("id", roomId)
    .eq("created_by", user.id)
    .select("id");
  if (error) return { error: "Could not cancel the draft." };
  if (!data || data.length === 0) {
    return { error: "The draft already started — it can't be cancelled now." };
  }

  redirect("/");
}
