-- ============================================================
-- Sportemu Dev Seed Data
-- ============================================================
-- Catatan: Seed ini mengasumsikan auth.users sudah dibuat via Supabase Auth API.
-- Jalankan script ini SETELAH membuat user via dashboard/API.
--
-- Users yang perlu dibuat via Supabase Auth:
--   admin@trainerapp.dev / password123 (role: admin, full_name: Admin Sportemu)
--   budi@trainerapp.dev / password123 (role: trainer, full_name: Budi Santoso)
--   sari@trainerapp.dev / password123 (role: trainer, full_name: Sari Dewi)
--   andi@trainerapp.dev / password123 (role: trainer, full_name: Andi Pratama)
--
-- Setelah user dibuat, profile otomatis terbentuk via trigger.
-- Lalu jalankan seed ini untuk data tambahan.

-- ============================================================
-- TRAINERS (setelah profiles sudah ada via trigger)
-- ============================================================
-- Note: Gunakan UUID dari auth.users yang sudah dibuat.
-- Placeholder UUIDs di bawah — ganti dengan UUID asli dari Supabase Auth.

-- Budi — renang, prepaid
insert into trainers (id, specialty, bio, payment_type, is_active)
select p.id, 'renang', 'Pelatih renang berpengalaman 5 tahun', 'prepaid', true
from profiles p where p.full_name = 'Budi Santoso'
on conflict (id) do nothing;

-- Sari — gym, postpaid
insert into trainers (id, specialty, bio, payment_type, is_active)
select p.id, 'gym', 'Personal trainer gym & fitness', 'postpaid', true
from profiles p where p.full_name = 'Sari Dewi'
on conflict (id) do nothing;

-- Andi — yoga, prepaid
insert into trainers (id, specialty, bio, payment_type, is_active)
select p.id, 'yoga', 'Instruktur yoga bersertifikat', 'prepaid', true
from profiles p where p.full_name = 'Andi Pratama'
on conflict (id) do nothing;

-- ============================================================
-- TRAINER AVAILABILITY
-- ============================================================
-- Budi: Senin-Jumat 07:00-12:00
insert into trainer_availability (trainer_id, day_of_week, start_time, end_time)
select p.id, d, '07:00', '12:00'
from profiles p, generate_series(1, 5) as d
where p.full_name = 'Budi Santoso';

-- Sari: Senin-Sabtu 14:00-20:00
insert into trainer_availability (trainer_id, day_of_week, start_time, end_time)
select p.id, d, '14:00', '20:00'
from profiles p, generate_series(1, 6) as d
where p.full_name = 'Sari Dewi';

-- Andi: Selasa, Kamis, Sabtu 08:00-11:00
insert into trainer_availability (trainer_id, day_of_week, start_time, end_time)
select p.id, d, '08:00', '11:00'
from profiles p, unnest(array[2, 4, 6]) as d
where p.full_name = 'Andi Pratama';

-- ============================================================
-- PACKAGES
-- ============================================================
insert into packages (name, session_count, duration_days, price, description, is_active) values
  ('Paket 4x / Bulan', 4, 30, 800000.00, '4 sesi latihan per bulan', true),
  ('Paket 8x / Bulan', 8, 30, 1400000.00, '8 sesi latihan per bulan (hemat 12.5%)', true),
  ('Paket 12x / Bulan', 12, 30, 1800000.00, '12 sesi latihan per bulan (hemat 25%)', true);

-- ============================================================
-- CUSTOMERS
-- ============================================================
insert into customers (full_name, phone, email, address, notes, created_by) values
  ('Rini Wulandari', '081234567890', 'rini@email.com', 'Jl. Sudirman No. 10, Jakarta', 'Pemula renang', (select id from profiles where full_name = 'Admin Sportemu')),
  ('Dedi Kurniawan', '081234567891', 'dedi@email.com', 'Jl. Gatot Subroto No. 5, Jakarta', 'Target: muscle gain', (select id from profiles where full_name = 'Admin Sportemu')),
  ('Maya Sari', '081234567892', 'maya@email.com', 'Jl. Thamrin No. 20, Jakarta', 'Yoga untuk relaksasi', (select id from profiles where full_name = 'Admin Sportemu')),
  ('Agus Setiawan', '081234567893', 'agus@email.com', 'Jl. Rasuna Said No. 15, Jakarta', 'Renang anak', (select id from profiles where full_name = 'Admin Sportemu')),
  ('Lina Hartono', '081234567894', 'lina@email.com', 'Jl. Kuningan No. 8, Jakarta', 'Fitness general', (select id from profiles where full_name = 'Admin Sportemu'));

-- ============================================================
-- ENROLLMENTS
-- ============================================================
-- Rini → Budi (renang, prepaid, Paket 4x)
insert into enrollments (customer_id, trainer_id, package_id, payment_type, status, start_date, sessions_total, sessions_done, created_by)
select
  c.id, t.id, pkg.id, 'prepaid', 'active', current_date - interval '10 days', 4, 2,
  (select id from profiles where full_name = 'Admin Sportemu')
from customers c, trainers t, packages pkg
where c.full_name = 'Rini Wulandari'
  and t.id = (select id from profiles where full_name = 'Budi Santoso')
  and pkg.name = 'Paket 4x / Bulan';

-- Dedi → Sari (gym, postpaid, Paket 8x)
insert into enrollments (customer_id, trainer_id, package_id, payment_type, status, start_date, sessions_total, sessions_done, created_by)
select
  c.id, t.id, pkg.id, 'postpaid', 'active', current_date - interval '15 days', 8, 5,
  (select id from profiles where full_name = 'Admin Sportemu')
from customers c, trainers t, packages pkg
where c.full_name = 'Dedi Kurniawan'
  and t.id = (select id from profiles where full_name = 'Sari Dewi')
  and pkg.name = 'Paket 8x / Bulan';

-- Maya → Andi (yoga, prepaid, Paket 4x)
insert into enrollments (customer_id, trainer_id, package_id, payment_type, status, start_date, sessions_total, sessions_done, created_by)
select
  c.id, t.id, pkg.id, 'prepaid', 'active', current_date - interval '5 days', 4, 1,
  (select id from profiles where full_name = 'Admin Sportemu')
from customers c, trainers t, packages pkg
where c.full_name = 'Maya Sari'
  and t.id = (select id from profiles where full_name = 'Andi Pratama')
  and pkg.name = 'Paket 4x / Bulan';

-- Agus → Budi (renang, prepaid, Paket 8x) — completed
insert into enrollments (customer_id, trainer_id, package_id, payment_type, status, start_date, end_date, sessions_total, sessions_done, created_by)
select
  c.id, t.id, pkg.id, 'prepaid', 'completed', current_date - interval '35 days', current_date - interval '5 days', 8, 8,
  (select id from profiles where full_name = 'Admin Sportemu')
from customers c, trainers t, packages pkg
where c.full_name = 'Agus Setiawan'
  and t.id = (select id from profiles where full_name = 'Budi Santoso')
  and pkg.name = 'Paket 8x / Bulan';

-- Lina → Sari (gym, postpaid, Paket 12x) — completed, invoice pending
insert into enrollments (customer_id, trainer_id, package_id, payment_type, status, start_date, end_date, sessions_total, sessions_done, created_by)
select
  c.id, t.id, pkg.id, 'postpaid', 'completed', current_date - interval '40 days', current_date - interval '2 days', 12, 12,
  (select id from profiles where full_name = 'Admin Sportemu')
from customers c, trainers t, packages pkg
where c.full_name = 'Lina Hartono'
  and t.id = (select id from profiles where full_name = 'Sari Dewi')
  and pkg.name = 'Paket 12x / Bulan';

-- ============================================================
-- SESSIONS (mix status)
-- ============================================================
-- Rini enrollment: 2 completed, 1 approved (upcoming), 1 proposed
insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date - interval '8 days', '08:00', '09:00', 'completed', 'customer_propose'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Rini Wulandari';

insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date - interval '4 days', '08:00', '09:00', 'completed', 'customer_propose'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Rini Wulandari';

insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date + interval '2 days', '08:00', '09:00', 'approved', 'customer_propose'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Rini Wulandari';

insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date + interval '6 days', '09:00', '10:00', 'proposed', 'customer_propose'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Rini Wulandari';

-- Dedi enrollment: 5 completed, 2 approved, 1 proposed
insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date - interval '12 days' + (n * interval '2 days'), '15:00', '16:00', 'completed', 'trainer_slot'
from enrollments e join customers c on c.id = e.customer_id, generate_series(0, 4) as n
where c.full_name = 'Dedi Kurniawan';

insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date + interval '1 day', '15:00', '16:00', 'approved', 'trainer_slot'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Dedi Kurniawan';

insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date + interval '3 days', '15:00', '16:00', 'approved', 'trainer_slot'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Dedi Kurniawan';

insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date + interval '5 days', '16:00', '17:00', 'proposed', 'customer_propose'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Dedi Kurniawan';

-- Maya enrollment: 1 completed, 1 approved (today!)
insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date - interval '3 days', '09:00', '10:00', 'completed', 'customer_propose'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Maya Sari';

insert into sessions (enrollment_id, trainer_id, scheduled_date, start_time, end_time, status, booking_source)
select e.id, e.trainer_id, current_date, '09:00', '10:00', 'approved', 'customer_propose'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Maya Sari';

-- ============================================================
-- INVOICES & PAYMENTS
-- ============================================================
-- Invoice 1: Rini (prepaid) — paid & verified
insert into invoices (enrollment_id, invoice_number, amount, status, due_date)
select e.id, generate_invoice_number(), 800000.00, 'paid', current_date - interval '8 days'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Rini Wulandari';

insert into payments (invoice_id, amount, status, verified_by, verified_at)
select i.id, 800000.00, 'verified',
  (select id from profiles where full_name = 'Admin Sportemu'),
  current_date - interval '9 days'
from invoices i
join enrollments e on e.id = i.enrollment_id
join customers c on c.id = e.customer_id
where c.full_name = 'Rini Wulandari';

-- Invoice 2: Maya (prepaid) — sent, payment pending verification
insert into invoices (enrollment_id, invoice_number, amount, status, due_date)
select e.id, generate_invoice_number(), 800000.00, 'sent', current_date + interval '5 days'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Maya Sari';

insert into payments (invoice_id, amount, status, proof_url, proof_uploaded_at)
select i.id, 800000.00, 'pending', 'proof/maya_transfer.jpg', now() - interval '1 day'
from invoices i
join enrollments e on e.id = i.enrollment_id
join customers c on c.id = e.customer_id
where c.full_name = 'Maya Sari';

-- Invoice 3: Lina (postpaid, completed) — sent, belum dibayar
insert into invoices (enrollment_id, invoice_number, amount, status, due_date)
select e.id, generate_invoice_number(), 1800000.00, 'sent', current_date + interval '14 days'
from enrollments e join customers c on c.id = e.customer_id where c.full_name = 'Lina Hartono';

-- ============================================================
-- CHECK-INS (untuk completed sessions)
-- ============================================================
-- Check-in records untuk Rini's completed sessions
insert into check_ins (session_id, trainer_id, type, photo_url)
select s.id, s.trainer_id, 'check_in', s.trainer_id || '/' || s.id || '/check_in_' || extract(epoch from now())::int || '.jpg'
from sessions s
join enrollments e on e.id = s.enrollment_id
join customers c on c.id = e.customer_id
where c.full_name = 'Rini Wulandari' and s.status = 'completed';

insert into check_ins (session_id, trainer_id, type, photo_url)
select s.id, s.trainer_id, 'check_out', s.trainer_id || '/' || s.id || '/check_out_' || extract(epoch from now())::int || '.jpg'
from sessions s
join enrollments e on e.id = s.enrollment_id
join customers c on c.id = e.customer_id
where c.full_name = 'Rini Wulandari' and s.status = 'completed';

-- Check-in records untuk Maya's completed session
insert into check_ins (session_id, trainer_id, type, photo_url)
select s.id, s.trainer_id, 'check_in', s.trainer_id || '/' || s.id || '/check_in_' || extract(epoch from now())::int || '.jpg'
from sessions s
join enrollments e on e.id = s.enrollment_id
join customers c on c.id = e.customer_id
where c.full_name = 'Maya Sari' and s.status = 'completed';

insert into check_ins (session_id, trainer_id, type, photo_url)
select s.id, s.trainer_id, 'check_out', s.trainer_id || '/' || s.id || '/check_out_' || extract(epoch from now())::int || '.jpg'
from sessions s
join enrollments e on e.id = s.enrollment_id
join customers c on c.id = e.customer_id
where c.full_name = 'Maya Sari' and s.status = 'completed';
