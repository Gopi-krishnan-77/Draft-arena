-- Row Level Security.
-- Strategy: authenticated users can READ all draft data (it isn't sensitive).
-- Direct writes are limited to the two simple, self-authored inserts (create a
-- room, join a room) plus the creator starting their own room. Picks go only
-- through make_pick() (SECURITY DEFINER), so no pick-insert policy is needed.

alter table players            enable row level security;
alter table draft_rooms        enable row level security;
alter table draft_participants enable row level security;
alter table draft_picks        enable row level security;
alter table draft_analyses     enable row level security;

-- ── Reads ──────────────────────────────────────────────────────
create policy "read players"   on players            for select to authenticated using (true);
create policy "read rooms"     on draft_rooms        for select to authenticated using (true);
create policy "read parts"     on draft_participants for select to authenticated using (true);
create policy "read picks"     on draft_picks        for select to authenticated using (true);
create policy "read analyses"  on draft_analyses     for select to authenticated using (true);

-- ── Writes ─────────────────────────────────────────────────────
create policy "create own room" on draft_rooms
  for insert to authenticated
  with check (created_by = auth.uid());

create policy "start own room" on draft_rooms
  for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "join as self" on draft_participants
  for insert to authenticated
  with check (user_id = auth.uid());

-- (No insert/update/delete policies on draft_picks — picks must go through make_pick().)
