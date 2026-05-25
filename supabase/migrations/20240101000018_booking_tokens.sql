-- 018 — Booking Tokens for shareable calendar links

-- Enable pgcrypto for gen_random_bytes
create extension if not exists pgcrypto with schema extensions;

-- Add booking token to enrollments
alter table enrollments add column booking_token text unique;

-- Generate token for existing enrollments
update enrollments set booking_token = encode(extensions.gen_random_bytes(16), 'hex') where booking_token is null;

-- Make it not null with default for new enrollments
alter table enrollments alter column booking_token set default encode(extensions.gen_random_bytes(16), 'hex');
alter table enrollments alter column booking_token set not null;

-- Allow public read of enrollment via booking token (no auth needed)
create policy "Public read via booking token" on enrollments for select
  using (booking_token is not null);

-- Allow public read of sessions for booking page
create policy "Public read sessions via enrollment" on sessions for select
  using (enrollment_id in (select id from enrollments where booking_token is not null));

-- Allow public insert of proposed sessions (from booking page)
create policy "Public propose session via booking" on sessions for insert
  with check (
    status = 'proposed' and
    booking_source = 'customer_propose' and
    enrollment_id in (select id from enrollments where status = 'active')
  );

-- Allow public read trainer availability
create policy "Public read trainer availability" on trainer_availability for select
  using (true);
