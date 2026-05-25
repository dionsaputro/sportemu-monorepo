-- 002 — Trainers

create type payment_type as enum ('prepaid', 'postpaid');

create table trainers (
  id              uuid primary key references profiles(id) on delete cascade,
  specialty       text,
  bio             text,
  payment_type    payment_type not null default 'prepaid',
  is_active       boolean default true,
  created_at      timestamptz default now()
);
