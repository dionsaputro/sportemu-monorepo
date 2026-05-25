-- 005 — Customers

create table customers (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  phone       text,
  email       text,
  address     text,
  notes       text,
  created_by  uuid references profiles(id),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
