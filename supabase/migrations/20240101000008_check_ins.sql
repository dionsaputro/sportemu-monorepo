-- 008 — Check-ins

create type checkin_type as enum ('check_in', 'check_out');

create table check_ins (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  trainer_id  uuid not null references trainers(id),
  type        checkin_type not null,
  photo_url   text not null,
  latitude    numeric(9,6),
  longitude   numeric(9,6),
  server_ts   timestamptz default now()
);

-- Satu check_in dan satu check_out per session
create unique index idx_check_ins_session_type on check_ins(session_id, type);
