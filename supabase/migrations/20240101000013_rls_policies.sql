-- 013 — Row Level Security Policies

-- Helper functions
create or replace function get_my_role()
returns user_role as $$
  select role from profiles where id = auth.uid();
$$ language sql security definer;

create or replace function is_admin()
returns boolean as $$
  select get_my_role() = 'admin';
$$ language sql security definer;

create or replace function is_trainer()
returns boolean as $$
  select get_my_role() = 'trainer';
$$ language sql security definer;

-- PROFILES
alter table profiles enable row level security;
create policy "Admin full access" on profiles for all using (is_admin());
create policy "Trainer read all" on profiles for select using (is_trainer());
create policy "Trainer update self" on profiles for update using (auth.uid() = id);

-- TRAINERS
alter table trainers enable row level security;
create policy "Admin full access" on trainers for all using (is_admin());
create policy "Trainer read all" on trainers for select using (is_trainer());
create policy "Trainer update self" on trainers for update using (auth.uid() = id);

-- TRAINER AVAILABILITY
alter table trainer_availability enable row level security;
create policy "Admin full access" on trainer_availability for all using (is_admin());
create policy "Trainer manage own" on trainer_availability for all using (trainer_id = auth.uid());
create policy "Trainer read all" on trainer_availability for select using (is_trainer());

-- PACKAGES
alter table packages enable row level security;
create policy "Admin full access" on packages for all using (is_admin());
create policy "Trainer read active" on packages for select using (is_trainer() and is_active = true);

-- CUSTOMERS
alter table customers enable row level security;
create policy "Admin full access" on customers for all using (is_admin());
create policy "Trainer read own customers" on customers for select
  using (id in (select customer_id from enrollments where trainer_id = auth.uid()));

-- ENROLLMENTS
alter table enrollments enable row level security;
create policy "Admin full access" on enrollments for all using (is_admin());
create policy "Trainer read own" on enrollments for select using (trainer_id = auth.uid());

-- SESSIONS
alter table sessions enable row level security;
create policy "Admin full access" on sessions for all using (is_admin());
create policy "Trainer access own" on sessions for all using (trainer_id = auth.uid());

-- CHECK_INS
alter table check_ins enable row level security;
create policy "Admin full access" on check_ins for all using (is_admin());
create policy "Trainer insert own" on check_ins for insert with check (trainer_id = auth.uid());
create policy "Trainer read own" on check_ins for select using (trainer_id = auth.uid());

-- INVOICES
alter table invoices enable row level security;
create policy "Admin full access" on invoices for all using (is_admin());
create policy "Trainer read own" on invoices for select
  using (enrollment_id in (select id from enrollments where trainer_id = auth.uid()));

-- PAYMENTS
alter table payments enable row level security;
create policy "Admin full access" on payments for all using (is_admin());
create policy "Trainer read own" on payments for select
  using (invoice_id in (
    select i.id from invoices i
    join enrollments e on e.id = i.enrollment_id
    where e.trainer_id = auth.uid()
  ));

-- NOTIFICATIONS
alter table notifications enable row level security;
create policy "User see own" on notifications for select using (user_id = auth.uid());
create policy "User update own" on notifications for update using (user_id = auth.uid());
