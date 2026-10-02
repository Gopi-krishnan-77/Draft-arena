-- AI verdict: allow a room's participants to write its analysis rows.
-- (Read policy already granted to authenticated users in 0003_rls.sql.)

create policy "insert analyses as participant" on draft_analyses
  for insert to authenticated
  with check (
    exists (
      select 1
      from draft_participants p
      where p.room_id = draft_analyses.room_id
        and p.user_id = auth.uid()
    )
  );
