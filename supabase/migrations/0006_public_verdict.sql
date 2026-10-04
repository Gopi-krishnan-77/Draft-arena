-- Public verdict pages + link previews.
-- Read access to draft data is authenticated-only (0003), so anonymous visitors
-- of a shared /draft/<id>/verdict link — and the crawlers that build link
-- previews — can't see anything. Rather than opening the tables to `anon`
-- (which would expose join codes and user ids), expose exactly what a finished
-- draft's public page needs through one read-only SECURITY DEFINER function.
--
-- Returns NULL unless the room exists and is COMPLETED.

create or replace function public.get_public_verdict(p_room_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'room', jsonb_build_object(
      'id', r.id,
      'name', r.name,
      'draftType', r.draft_type
    ),
    -- auth.uid() is the caller (NULL for anonymous visitors).
    'isParticipant', exists (
      select 1 from draft_participants p
      where p.room_id = r.id and p.user_id = auth.uid()
    ),
    'teams', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'position', p.draft_position,
        'name', p.display_name,
        'players', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'id', pl.id,
            'name', pl.name,
            'role', pl.role,
            'rating', pl.rating,
            'metadata', pl.metadata
          ) order by pk.pick_number), '[]'::jsonb)
          from draft_picks pk
          join players pl on pl.id = pk.player_id
          where pk.room_id = r.id and pk.participant_id = p.id
        )
      ) order by p.draft_position), '[]'::jsonb)
      from draft_participants p
      where p.room_id = r.id
    ),
    'verdicts', (
      select coalesce(jsonb_object_agg(a.mode, a.result), '{}'::jsonb)
      from draft_analyses a
      where a.room_id = r.id
    )
  )
  from draft_rooms r
  where r.id = p_room_id
    and r.status = 'COMPLETED';
$$;

revoke all on function public.get_public_verdict(uuid) from public;
grant execute on function public.get_public_verdict(uuid) to anon, authenticated;
