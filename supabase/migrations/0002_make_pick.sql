-- Atomic, race-proof pick. Computes whose turn it is (snake order), enforces it,
-- and inserts the pick under the table's unique constraints — all in one call.
-- SECURITY DEFINER so it can read/write while still keying off the caller's
-- auth.uid(). Returns the created pick row.

create or replace function public.make_pick(p_room_id uuid, p_player_id uuid)
returns draft_picks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room       draft_rooms;
  v_count      int;
  v_round      int;       -- 0-based
  v_in_round   int;
  v_position   int;       -- 0-based seat whose turn it is
  v_me         draft_participants;
  v_pick       draft_picks;
begin
  -- Lock the room row to serialize concurrent picks.
  select * into v_room from draft_rooms where id = p_room_id for update;
  if v_room is null then
    raise exception 'Draft not found';
  end if;
  if v_room.status <> 'IN_PROGRESS' then
    raise exception 'Draft is not active';
  end if;

  select count(*) into v_count from draft_picks where room_id = p_room_id;
  if v_count >= v_room.roster_size * 2 then
    raise exception 'Draft is complete';
  end if;

  -- Snake order for 2 managers: 0,1,1,0,0,1,...
  v_round    := v_count / 2;
  v_in_round := v_count % 2;
  v_position := case when v_round % 2 = 0 then v_in_round else 1 - v_in_round end;

  select * into v_me
  from draft_participants
  where room_id = p_room_id and user_id = auth.uid();

  if v_me is null then
    raise exception 'You are not in this draft';
  end if;
  if v_me.draft_position <> v_position then
    raise exception 'Not your turn';
  end if;

  insert into draft_picks (room_id, round, pick_number, participant_id, player_id)
  values (p_room_id, v_round + 1, v_count + 1, v_me.id, p_player_id)
  returning * into v_pick;

  -- Final pick completes the draft.
  if v_count + 1 >= v_room.roster_size * 2 then
    update draft_rooms set status = 'COMPLETED' where id = p_room_id;
  end if;

  return v_pick;
end;
$$;
