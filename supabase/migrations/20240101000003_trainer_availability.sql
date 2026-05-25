-- 003 — Trainer Availability

create table trainer_availability (
  id           uuid primary key default gen_random_uuid(),
  trainer_id   uuid not null references trainers(id) on delete cascade,
  day_of_week  int not null check (day_of_week between 0 and 6),
  start_time   time not null,
  end_time     time not null,
  is_active    boolean default true
);
