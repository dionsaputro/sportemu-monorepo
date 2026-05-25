-- 009 — Invoices & Payments

create type invoice_status as enum ('draft', 'sent', 'paid', 'overdue', 'cancelled');
create type payment_status as enum ('pending', 'verified', 'rejected');

create table invoices (
  id              uuid primary key default gen_random_uuid(),
  enrollment_id   uuid not null references enrollments(id) on delete restrict,
  invoice_number  text unique not null,
  amount          numeric(12,2) not null,
  status          invoice_status default 'draft',
  due_date        date,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create table payments (
  id                  uuid primary key default gen_random_uuid(),
  invoice_id          uuid not null references invoices(id) on delete restrict,
  amount              numeric(12,2) not null,
  status              payment_status default 'pending',
  proof_url           text,
  proof_uploaded_at   timestamptz,
  verified_by         uuid references profiles(id),
  verified_at         timestamptz,
  rejection_reason    text,
  notes               text,
  created_at          timestamptz default now()
);
