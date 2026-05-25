-- 007 — Sessions

create type session_status as enum (
  'proposed',
  'approved',
  'rejected',
  'completed',
  'cancelled',
  'missed'
);

create type booking_source as enum ('customer_propose', 'trainer_slot');

create table sessions (
  id               uuid primary key default gen_random_uuid(),
  enrollment_id    uuid not null references enrollments(id) on delete cascade,
  trainer_id       uuid not null references trainers(id),
  scheduled_date   date not null,
  start_time       time not null,
  end_time         time not null,
  status           session_status default 'proposed',
  booking_source   booking_source not null,
  notes            text,
  rejection_reason text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
