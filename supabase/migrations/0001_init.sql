-- Draft Arena — core schema
-- Run in the Supabase SQL editor (or via the Supabase CLI). Idempotent-ish:
-- safe to run once on a fresh project.

-- ── Enums ──────────────────────────────────────────────────────
create type draft_type as enum ('GOAT_XI', 'ALL_TIME_XI', 'UNDERRATED_XI');
create type draft_status as enum ('LOBBY', 'IN_PROGRESS', 'COMPLETED');
create type player_role as enum ('GK', 'DEF', 'MID', 'FWD');
create type verdict_mode as enum ('ANALYST', 'COMMENTATOR', 'HISTORIAN', 'TRASH_TALK');

-- ── Players (seed data) ────────────────────────────────────────
create table players (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  role     player_role not null,
  rating   int not null check (rating between 0 and 99),
  metadata jsonb not null default '{}' -- { club, nationality, era, imageUrl }
);
create index players_role_idx on players (role);

-- ── Draft rooms ────────────────────────────────────────────────
create table draft_rooms (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  draft_type  draft_type not null,
  status      draft_status not null default 'LOBBY',
  roster_size int not null default 11,
  join_code   text not null unique,
  created_by  uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index draft_rooms_status_idx on draft_rooms (status, created_at desc);
create index draft_rooms_created_by_idx on draft_rooms (created_by);

-- ── Participants (exactly 2 per room in V1) ────────────────────
create table draft_participants (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references draft_rooms (id) on delete cascade,
  user_id        uuid not null references auth.users (id) on delete cascade,
  display_name   text not null,
  draft_position int not null check (draft_position in (0, 1)),
  created_at     timestamptz not null default now(),
  unique (room_id, user_id),
  unique (room_id, draft_position)
);
create index draft_participants_room_idx on draft_participants (room_id);

-- ── Picks ──────────────────────────────────────────────────────
create table draft_picks (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references draft_rooms (id) on delete cascade,
  round          int not null,
  pick_number    int not null,
  participant_id uuid not null references draft_participants (id) on delete cascade,
  player_id      uuid not null references players (id),
  created_at     timestamptz not null default now(),
  unique (room_id, player_id),   -- no duplicate player in a room
  unique (room_id, pick_number)  -- no two picks claim the same slot
);
create index draft_picks_room_idx on draft_picks (room_id, pick_number);

-- ── AI verdict (Week 3) ────────────────────────────────────────
create table draft_analyses (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references draft_rooms (id) on delete cascade,
  mode       verdict_mode not null,
  model      text not null,
  result     jsonb not null,
  created_at timestamptz not null default now(),
  unique (room_id, mode)
);
