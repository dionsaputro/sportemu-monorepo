-- 004 — Packages (Pricing)

create table packages (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  session_count   int not null,
  duration_days   int not null default 30,
  price           numeric(12,2) not null,
  description     text,
  is_active       boolean default true,
  created_at      timestamptz default now()
);
