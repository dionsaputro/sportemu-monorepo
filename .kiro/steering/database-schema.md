# Database Schema & RLS

## Tables & Migrations (urutan eksekusi)

### 001 — Roles & Profiles
- `profiles` — references `auth.users(id)`, fields: role (admin/trainer), full_name, phone, avatar_url, fcm_token
- Trigger `handle_new_user()` auto-create profile on signup

### 002 — Trainers
- `trainers` — references `profiles(id)`, fields: specialty, bio, is_active, home_city_id
- `payment_type` DEPRECATED — sekarang ada di enrollment level saja

### 003 — Trainer Availability
- `trainer_availability` — trainer_id, day_of_week (0-6), start_time, end_time, is_active
- Trainer mengatur sendiri waktu available-nya (default slots yang bisa dipilih customer)

### 003b — Specialties & Cities (dynamic)
- `specialties` — name (unique), is_active. Admin bisa tambah kapan saja.
- `trainer_specialties` — many-to-many (trainer bisa punya >1 keahlian)
- `cities` — name (unique), is_active. Admin bisa tambah kapan saja.
- `trainer_available_cities` — many-to-many (trainer available di beberapa kota)

### 004 — Packages
- `packages` — name, session_count, duration_days (default 30), price, is_active

### 005 — Customers
- `customers` — full_name, phone, email, address, notes, city_id, created_by

### 006 — Enrollments
- `enrollments` — customer_id, trainer_id, package_id, payment_type, status (active/completed/cancelled/suspended), sessions_total, sessions_done

### 007 — Sessions
- `sessions` — enrollment_id, trainer_id, scheduled_date, start_time, end_time, status (proposed/approved/rejected/completed/cancelled/missed), booking_source (customer_propose/trainer_slot)

### 008 — Check-ins
- `check_ins` — session_id, trainer_id, type (check_in/check_out), photo_url, latitude, longitude, server_ts (default now())
- Unique index on (session_id, type)

### 009 — Invoices & Payments
- `invoices` — enrollment_id, invoice_number (unique, from sequence), amount, status (draft/sent/paid/overdue/cancelled), due_date
- `payments` — invoice_id, amount, status (pending/verified/rejected), proof_url, verified_by

### 010 — Notifications
- `notifications` — user_id, type (booking_proposed/approved/rejected, checkin_reminder, payment_verified/rejected, invoice_created), title, body, data (jsonb), is_read

### 011 — Invoice Number Sequence
- Sequence `invoice_number_seq`, format: `INV-{YYYY}-{0001}`

### 012 — Outstanding View
- `trainer_outstanding_view` — prepaid_sessions_owed (sesi dibayar belum jalan), postpaid_amount_owed (invoice belum dibayar)

## RLS Policies (Ringkasan)

- **Admin:** full access ke semua tabel
- **Trainer:** read all profiles/trainers, update self, manage own availability, read own customers/enrollments/sessions/invoices/payments, insert/read own check_ins
- **Notifications:** user see/update own only

## Storage

- Bucket: `check-in-photos` (private)
- Path convention: `{trainer_id}/{session_id}/check_in_{unix_ts}.jpg`
- Trainer upload ke folder sendiri, admin bisa lihat semua
- Gunakan signed URL (expire 1 jam) untuk preview
