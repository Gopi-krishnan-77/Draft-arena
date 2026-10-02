-- Week 4: realtime, pick timer + auto-draft, server-side formation rules,
-- and leave/cancel policies. Run after 0004.

-- ── 1. Turn timer bookkeeping ──────────────────────────────────
-- started_at anchors the 60s clock for the very first pick.
alter table draft_rooms add column if not exists started_at timestamptz;

-- ── 2. Realtime ────────────────────────────────────────────────
-- Publish the three live tables so clients get postgres_changes events.
-- Idempotent: ignores "already a member" errors on re-run.
do $$ begin
  alter publication supabase_realtime add table public.draft_rooms;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.draft_participants;
exception when duplicate_object then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.draft_picks;
exception when duplicate_object then null; end $$;

-- ── 3. Formation rules helper ──────────────────────────────────
-- Squad limits for an XI: GK 1/1, DEF 3/5, MID 2/5, FWD 1/3.
-- A role is draftable iff (a) its max isn't reached and (b) after taking it,
-- the remaining picks can still cover every unmet minimum.
create or replace function public.role_allowed(
  p_gk int, p_def int, p_mid int, p_fwd int,
  p_remaining int,          -- picks left INCLUDING the one being made
  p_role player_role
) returns boolean
language sql immutable as $$
  select case p_role
    when 'GK'  then p_gk  < 1 and
      greatest(0, 1 - (p_gk + 1)) + greatest(0, 3 - p_def) +
      greatest(0, 2 - p_mid) + greatest(0, 1 - p_fwd) <= p_remaining - 1
    when 'DEF' then p_def < 5 and
      greatest(0, 1 - p_gk) + greatest(0, 3 - (p_def + 1)) +
      greatest(0, 2 - p_mid) + greatest(0, 1 - p_fwd) <= p_remaining - 1
    when 'MID' then p_mid < 5 and
      greatest(0, 1 - p_gk) + greatest(0, 3 - p_def) +
      greatest(0, 2 - (p_mid + 1)) + greatest(0, 1 - p_fwd) <= p_remaining - 1
    when 'FWD' then p_fwd < 3 and
      greatest(0, 1 - p_gk) + greatest(0, 3 - p_def) +
      greatest(0, 2 - p_mid) + greatest(0, 1 - (p_fwd + 1)) <= p_remaining - 1
  end
$$;

-- ── 4. make_pick, hardened ─────────────────────────────────────
-- Adds server-side category eligibility + formation enforcement on top of the
-- existing turn/duplicate guards. Same signature as before.
create or replace function public.make_pick(p_room_id uuid, p_player_id uuid)
returns draft_picks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room     draft_rooms;
  v_count    int;
  v_round    int;
  v_in_round int;
  v_position int;
  v_me       draft_participants;
  v_player   players;
  v_gk int; v_def int; v_mid int; v_fwd int;
  v_pick     draft_picks;
begin
  select * into v_room from draft_rooms where id = p_room_id for update;
  if v_room is null then raise exception 'Draft not found'; end if;
  if v_room.status <> 'IN_PROGRESS' then raise exception 'Draft is not active'; end if;

  select count(*) into v_count from draft_picks where room_id = p_room_id;
  if v_count >= v_room.roster_size * 2 then raise exception 'Draft is complete'; end if;

  v_round    := v_count / 2;
  v_in_round := v_count % 2;
  v_position := case when v_round % 2 = 0 then v_in_round else 1 - v_in_round end;

  select * into v_me from draft_participants
    where room_id = p_room_id and user_id = auth.uid();
  if v_me is null then raise exception 'You are not in this draft'; end if;
  if v_me.draft_position <> v_position then raise exception 'Not your turn'; end if;

  select * into v_player from players where id = p_player_id;
  if v_player is null then raise exception 'Player not found'; end if;

  -- category eligibility (ALL_TIME_XI = everyone). coalesce: a missing
  -- 'categories' key must read as NOT eligible, not NULL-propagate to pass.
  if v_room.draft_type <> 'ALL_TIME_XI'
     and not coalesce(v_player.metadata->'categories' ? v_room.draft_type::text, false) then
    raise exception 'Player not eligible for this draft type';
  end if;

  -- formation limits
  select
    count(*) filter (where pl.role = 'GK'),
    count(*) filter (where pl.role = 'DEF'),
    count(*) filter (where pl.role = 'MID'),
    count(*) filter (where pl.role = 'FWD')
  into v_gk, v_def, v_mid, v_fwd
  from draft_picks dp join players pl on pl.id = dp.player_id
  where dp.room_id = p_room_id and dp.participant_id = v_me.id;

  if not role_allowed(v_gk, v_def, v_mid, v_fwd,
                      v_room.roster_size - (v_gk + v_def + v_mid + v_fwd),
                      v_player.role) then
    raise exception 'Position limit reached';
  end if;

  insert into draft_picks (room_id, round, pick_number, participant_id, player_id)
  values (p_room_id, v_round + 1, v_count + 1, v_me.id, p_player_id)
  returning * into v_pick;

  if v_count + 1 >= v_room.roster_size * 2 then
    update draft_rooms set status = 'COMPLETED' where id = p_room_id;
  end if;

  return v_pick;
end;
$$;

-- ── 5. auto_pick: the 60s turn clock ───────────────────────────
-- Any participant may call this once the current turn has run past 60 seconds
-- (measured from the last pick, or from started_at for the first pick). Drafts
-- the best-rated eligible player for the on-the-clock manager. This is how a
-- draft survives a disconnected or stalling opponent.
create or replace function public.auto_pick(p_room_id uuid)
returns draft_picks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room         draft_rooms;
  v_caller       draft_participants;
  v_count        int;
  v_round        int;
  v_in_round     int;
  v_position     int;
  v_turn_started timestamptz;
  v_picker       draft_participants;
  v_player       players;
  v_gk int; v_def int; v_mid int; v_fwd int;
  v_pick         draft_picks;
begin
  select * into v_room from draft_rooms where id = p_room_id for update;
  if v_room is null then raise exception 'Draft not found'; end if;
  if v_room.status <> 'IN_PROGRESS' then raise exception 'Draft is not active'; end if;

  select * into v_caller from draft_participants
    where room_id = p_room_id and user_id = auth.uid();
  if v_caller is null then raise exception 'You are not in this draft'; end if;

  select count(*) into v_count from draft_picks where room_id = p_room_id;
  if v_count >= v_room.roster_size * 2 then raise exception 'Draft is complete'; end if;

  select max(created_at) into v_turn_started from draft_picks where room_id = p_room_id;
  v_turn_started := coalesce(v_turn_started, v_room.started_at);
  if v_turn_started is null then raise exception 'Turn timer unavailable'; end if;
  if now() < v_turn_started + interval '60 seconds' then
    raise exception 'Turn has not expired';
  end if;

  v_round    := v_count / 2;
  v_in_round := v_count % 2;
  v_position := case when v_round % 2 = 0 then v_in_round else 1 - v_in_round end;

  select * into v_picker from draft_participants
    where room_id = p_room_id and draft_position = v_position;
  if v_picker is null then raise exception 'Picker not found'; end if;

  select
    count(*) filter (where pl.role = 'GK'),
    count(*) filter (where pl.role = 'DEF'),
    count(*) filter (where pl.role = 'MID'),
    count(*) filter (where pl.role = 'FWD')
  into v_gk, v_def, v_mid, v_fwd
  from draft_picks dp join players pl on pl.id = dp.player_id
  where dp.room_id = p_room_id and dp.participant_id = v_picker.id;

  select p.* into v_player
  from players p
  where p.id not in (select player_id from draft_picks where room_id = p_room_id)
    and (v_room.draft_type = 'ALL_TIME_XI'
         or p.metadata->'categories' ? v_room.draft_type::text)
    and role_allowed(v_gk, v_def, v_mid, v_fwd,
                     v_room.roster_size - (v_gk + v_def + v_mid + v_fwd),
                     p.role)
  order by p.rating desc, p.name asc
  limit 1;

  if v_player is null then raise exception 'No eligible player available'; end if;

  insert into draft_picks (room_id, round, pick_number, participant_id, player_id)
  values (p_room_id, v_round + 1, v_count + 1, v_picker.id, v_player.id)
  returning * into v_pick;

  if v_count + 1 >= v_room.roster_size * 2 then
    update draft_rooms set status = 'COMPLETED' where id = p_room_id;
  end if;

  return v_pick;
end;
$$;

-- ── 6. Atomic start / leave (race-proof) ───────────────────────
-- Starting and leaving both lock the room row FOR UPDATE and re-check state
-- after acquiring the lock, so "host starts" and "guest leaves" serialize —
-- a draft can never enter IN_PROGRESS with fewer than 2 managers.

create or replace function public.start_draft(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room  draft_rooms;
  v_count int;
begin
  select * into v_room from draft_rooms where id = p_room_id for update;
  if v_room is null then raise exception 'Draft not found'; end if;
  if v_room.created_by <> auth.uid() then raise exception 'Only the host can start'; end if;
  if v_room.status <> 'LOBBY' then raise exception 'Draft already started'; end if;

  select count(*) into v_count from draft_participants where room_id = p_room_id;
  if v_count < 2 then raise exception 'Waiting for opponent'; end if;

  update draft_rooms
  set status = 'IN_PROGRESS', started_at = now()
  where id = p_room_id;
end;
$$;

create or replace function public.leave_room(p_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room draft_rooms;
begin
  select * into v_room from draft_rooms where id = p_room_id for update;
  if v_room is null then raise exception 'Draft not found'; end if;
  if v_room.status <> 'LOBBY' then raise exception 'Draft already started'; end if;
  if v_room.created_by = auth.uid() then
    raise exception 'Host must cancel the draft instead';
  end if;

  delete from draft_participants
  where room_id = p_room_id and user_id = auth.uid();
  if not found then raise exception 'You are not in this draft'; end if;
end;
$$;

-- Cancelling deletes the room row itself, which also takes the row lock and
-- therefore serializes against start_draft(). A cancel that loses the race
-- deletes 0 rows (policy no longer matches) — the app checks the row count.
create policy "cancel own lobby room" on draft_rooms
  for delete to authenticated
  using (created_by = auth.uid() and status = 'LOBBY');

-- ── 7. Lock down direct room updates ───────────────────────────
-- The LOBBY→IN_PROGRESS transition now happens only inside start_draft().
-- The 0003 policy allowed the creator to update ANY column at ANY time
-- (stall started_at, shrink roster_size, flip status) — remove it entirely.
drop policy if exists "start own room" on draft_rooms;

-- ── 8. Verdicts only for finished drafts ───────────────────────
-- Tighten the 0004 insert policy: a participant may only cache a verdict for
-- a COMPLETED room (prevents pre-completion cache poisoning).
drop policy if exists "insert analyses as participant" on draft_analyses;
create policy "insert analyses as participant" on draft_analyses
  for insert to authenticated
  with check (
    exists (
      select 1
      from draft_participants p
      join draft_rooms r on r.id = p.room_id
      where p.room_id = draft_analyses.room_id
        and p.user_id = auth.uid()
        and r.status = 'COMPLETED'
    )
  );
