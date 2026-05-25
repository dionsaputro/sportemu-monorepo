-- 006 — Enrollments

create type enrollment_status as enum ('active', 'completed', 'cancelled', 'suspended');

create table enrollments (
  id              uuid primary key default gen_random_uuid(),
  customer_id     uuid not null references customers(id) on delete restrict,
  trainer_id      uuid not null references trainers(id) on delete restrict,
  package_id      uuid not null references packages(id) on delete restrict,
  payment_type    payment_type not null,
  status          enrollment_status default 'active',
  start_date      date not null,
  end_date        date,
  sessions_total  int not null,
  sessions_done   int default 0,
  notes           text,
  created_by      uuid references profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
