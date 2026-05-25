-- 010 — Notifications

create type notif_type as enum (
  'booking_proposed',
  'booking_approved',
  'booking_rejected',
  'checkin_reminder',
  'payment_verified',
  'payment_rejected',
  'invoice_created'
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  type        notif_type not null,
  title       text not null,
  body        text,
  data        jsonb,
  is_read     boolean default false,
  created_at  timestamptz default now()
);
