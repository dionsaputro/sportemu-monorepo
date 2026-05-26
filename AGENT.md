# Sportemu — Agent Blueprint

## Ringkasan Proyek

**Sportemu** adalah platform SaaS untuk pelatih olahraga independen (renang, gym, yoga, dll).

### Business Model: SaaS (B2B2C)
- **Sportemu** = platform (jualan subscription ke trainer)
- **Trainer** = paying customer (subscribe, kelola bisnis sendiri)
- **Klien** = murid si trainer (ga interact langsung sama Sportemu)

### Aktor:
- **Super Admin (Sportemu)** — kelola subscribers, billing, platform config, subscription plans
- **Trainer** — full control: manage klien, paket, jadwal, invoice, check-in. Bayar subscription ke Sportemu.
- **Klien** — tidak punya login; booking via shareable link, semua diwakilkan trainer

### Freemium Model:
- **Free tier:** limited (misal 5 klien, 20 sesi/bulan) — configurable by admin
- **Paid tier:** unlimited (atau tier-based) — manual billing dulu, Stripe nanti

### Multi-tenant Strategy:
- **MVP:** Single database, filtered by `trainer_id` (current approach)
- **Scale:** Siap untuk multi-tenant isolation nanti (separate schemas atau row-level tenant isolation)

Platform: **Web** (Next.js 15) + **Mobile** (Flutter, iOS & Android), backend **Supabase**.

---

## Stack & Tooling

### Struktur Monorepo (Turborepo)

```
trainerapp/
├── apps/
│   ├── web/                  # Next.js 15 — landing page + admin + trainer dashboard (web)
│   └── mobile/               # Flutter — trainer app (iOS & Android)
├── packages/
│   └── types/                # Shared TypeScript types & Zod schemas (untuk web)
├── supabase/
│   ├── migrations/           # SQL migration files (001–012)
│   ├── seed.sql              # Dev seed data
│   └── functions/            # Edge Functions (Deno)
├── turbo.json
└── package.json
```

### Web App (`apps/web`)
- **Framework:** Next.js 15 (App Router, Server Components)
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** Supabase Auth SSR (`@supabase/ssr`)
- **State:** Zustand (client), React Query (server sync)
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Calendar:** date-fns + React Big Calendar
- **File upload:** Supabase Storage SDK
- **Landing page:** route `/` di dalam `apps/web` — bisa pakai Framer Motion untuk animasi
- **Check-in web:** `<input type="file" accept="image/*" capture="environment">` untuk akses kamera di mobile browser

### Mobile App (`apps/mobile`)
- **Framework:** Flutter (latest stable)
- **Backend SDK:** `supabase_flutter`
- **Auth:** Supabase Auth (email/password)
- **Camera:** `image_picker` + `camera` package
- **Push Notifications:** Firebase Cloud Messaging (FCM) via `firebase_messaging`
- **State management:** Riverpod
- **Navigation:** GoRouter
- **Calendar UI:** `table_calendar` package
- **Image compression:** `flutter_image_compress`

### Backend (Supabase)
- **Database:** PostgreSQL 15
- **Auth:** Supabase Auth (JWT + RLS)
- **Storage:** Bucket `check-in-photos` (private)
- **Realtime:** Notifikasi booking baru ke trainer (web & mobile)
- **Edge Functions:** Deno — push notification trigger, auto invoice

---

## Database Schema (Lengkap)

Jalankan migrations dalam urutan ini:

### 001 — Roles & Profiles

```sql
create type user_role as enum ('admin', 'trainer');

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  role        user_role not null,
  full_name   text not null,
  phone       text,
  avatar_url  text,
  fcm_token   text,                    -- Firebase push token (mobile)
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Trigger: auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'trainer'),
    coalesce(new.raw_user_meta_data->>'full_name', new.email)
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
```

### 002 — Trainers

```sql
create type payment_type as enum ('prepaid', 'postpaid');

create table trainers (
  id              uuid primary key references profiles(id) on delete cascade,
  specialty       text,                    -- e.g. 'renang', 'gym'
  bio             text,
  payment_type    payment_type not null default 'prepaid',
  is_active       boolean default true,
  created_at      timestamptz default now()
);
```

### 003 — Trainer Availability

```sql
create table trainer_availability (
  id           uuid primary key default gen_random_uuid(),
  trainer_id   uuid not null references trainers(id) on delete cascade,
  day_of_week  int not null check (day_of_week between 0 and 6), -- 0=Sun
  start_time   time not null,
  end_time     time not null,
  is_active    boolean default true
);
```

### 004 — Packages (Pricing)

```sql
create table packages (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,              -- e.g. "Paket 4x / Bulan"
  session_count   int not null,
  duration_days   int not null default 30,
  price           numeric(12,2) not null,
  description     text,
  is_active       boolean default true,
  created_at      timestamptz default now()
);
```

### 005 — Customers

```sql
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
```

### 006 — Enrollments

```sql
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
```

### 007 — Sessions

```sql
create type session_status as enum (
  'proposed',
  'approved',
  'rejected',
  'completed',
  'cancelled',
  'missed'
);

create type booking_source as enum ('customer_propose', 'trainer_slot');

create table sessions (
  id               uuid primary key default gen_random_uuid(),
  enrollment_id    uuid not null references enrollments(id) on delete cascade,
  trainer_id       uuid not null references trainers(id),
  scheduled_date   date not null,
  start_time       time not null,
  end_time         time not null,
  status           session_status default 'proposed',
  booking_source   booking_source not null,
  notes            text,
  rejection_reason text,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);
```

### 008 — Check-ins

```sql
create type checkin_type as enum ('check_in', 'check_out');

create table check_ins (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid not null references sessions(id) on delete cascade,
  trainer_id  uuid not null references trainers(id),
  type        checkin_type not null,
  photo_url   text not null,
  latitude    numeric(9,6),
  longitude   numeric(9,6),
  server_ts   timestamptz default now()    -- timestamp dari server, anti-fake
);

-- Satu check_in dan satu check_out per session
create unique index on check_ins(session_id, type);
```

### 009 — Invoices & Payments

```sql
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
```

### 010 — Notifications

```sql
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
```

### 011 — Invoice Number Sequence

```sql
create sequence invoice_number_seq start 1;

create or replace function generate_invoice_number()
returns text as $$
  select 'INV-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
$$ language sql;
```

### 012 — Outstanding View

```sql
create view trainer_outstanding_view as
select
  t.id as trainer_id,
  p.full_name as trainer_name,
  t.payment_type,
  -- prepaid: sesi sudah dibayar tapi belum dijalankan
  case when t.payment_type = 'prepaid' then
    coalesce((
      select sum(e.sessions_total - e.sessions_done)
      from enrollments e
      join invoices i on i.enrollment_id = e.id
      join payments pay on pay.invoice_id = i.id
      where e.trainer_id = t.id
        and e.status = 'active'
        and pay.status = 'verified'
        and e.sessions_done < e.sessions_total
    ), 0)
  end as prepaid_sessions_owed,
  -- postpaid: total invoice belum dibayar
  case when t.payment_type = 'postpaid' then
    coalesce((
      select sum(i.amount)
      from invoices i
      join enrollments e on e.id = i.enrollment_id
      where e.trainer_id = t.id
        and i.status in ('sent', 'overdue')
    ), 0)
  end as postpaid_amount_owed
from trainers t
join profiles p on p.id = t.id
where t.is_active = true;
```

---

## Row Level Security (RLS)

```sql
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

-- PACKAGES, CUSTOMERS
alter table packages enable row level security;
create policy "Admin full access" on packages for all using (is_admin());
create policy "Trainer read active" on packages for select using (is_trainer() and is_active = true);

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

-- INVOICES & PAYMENTS
alter table invoices enable row level security;
create policy "Admin full access" on invoices for all using (is_admin());
create policy "Trainer read own" on invoices for select
  using (enrollment_id in (select id from enrollments where trainer_id = auth.uid()));

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
```

---

## Supabase Storage

```sql
-- Bucket private untuk foto check-in
insert into storage.buckets (id, name, public)
values ('check-in-photos', 'check-in-photos', false);

-- Trainer hanya upload ke folder sendiri
create policy "Trainer upload own" on storage.objects
  for insert with check (
    bucket_id = 'check-in-photos' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Trainer lihat folder sendiri, admin lihat semua
create policy "Read own photos" on storage.objects
  for select using (
    bucket_id = 'check-in-photos' and (
      is_admin() or
      auth.uid()::text = (storage.foldername(name))[1]
    )
  );
```

Path convention: `{trainer_id}/{session_id}/check_in_{unix_ts}.jpg`
Generate signed URL (expire 1 jam) untuk preview — jangan simpan public URL.

---

## Business Logic

### Hybrid Booking Flow

**Mode A — Customer Propose (via Admin):**
1. Admin buka enrollment → klik "Tambah Sesi" → input tanggal & jam
2. Session terbentuk: `status: 'proposed'`, `booking_source: 'customer_propose'`
3. Trainer dapat notifikasi Realtime (web) + FCM push (mobile)
4. Trainer approve → `status: 'approved'` / reject → `status: 'rejected'` + alasan
5. Trainer bisa approve/reject dari web maupun dari Flutter app

**Mode B — Trainer Set Slot:**
1. Trainer buka kalender (web atau Flutter) → tambah availability slot
2. Admin lihat slot kosong trainer di kalender global
3. Admin assign customer ke slot → Session langsung `status: 'approved'`

### Check-in / Check-out Rules

```
SYARAT CHECK-IN:
- session.status = 'approved'
- scheduled_date = today
- jam sekarang dalam window: start_time ± 15 menit
- belum ada record check_in untuk session ini

SYARAT CHECK-OUT:
- check_in sudah ada untuk session ini
- jam sekarang >= end_time - 5 menit

SETELAH CHECK-OUT BERHASIL:
- session.status → 'completed'
- enrollment.sessions_done + 1
- jika sessions_done = sessions_total:
    - enrollment.status → 'completed'
    - jika postpaid → trigger auto-invoice Edge Function
```

### Check-in: Web vs Mobile

```
Web (trainer pakai browser):
- Input foto via <input type="file" accept="image/*" capture="environment">
- Di mobile browser, ini membuka kamera langsung
- Di desktop browser, trainer bisa upload foto dari file
- Kompres di client-side sebelum upload (canvas resize, max 800px, < 500KB)
- server_ts tetap dari server (DB default now())

Mobile/Flutter:
- Kamera native via image_picker (lebih smooth, langsung ke kamera)
- Kompres via flutter_image_compress
- Upload ke Supabase Storage
- server_ts tetap dari server (DB default now())

Keduanya menghasilkan record check_ins yang identik di database.
```

### Payment Outstanding Logic

```
PREPAID (bayar dulu, baru belajar):
- Enrollment dibuat → Invoice dibuat (status: draft → sent)
- Admin input bukti transfer customer → payment.status: pending
- Admin verifikasi → payment.status: verified → enrollment aktif
- Outstanding admin: sessions_done < sessions_total (sesi yang belum dijalankan)

POSTPAID (belajar dulu, bayar setelah paket habis):
- Enrollment dibuat → langsung aktif, sesi bisa jalan
- Invoice otomatis dibuat saat enrollment completed
- Customer bayar → admin verifikasi bukti transfer
- Outstanding admin: invoice status 'sent' / 'overdue' belum dibayar
- Outstanding trainer: sesi completed tapi invoice belum paid
```

---

## Web App — Route Structure (`apps/web`)

```
app/
├── page.tsx                              # Landing page (public)
├── about/page.tsx                        # Tentang kami (public)
├── pricing/page.tsx                      # Harga & paket (public)
│
├── (auth)/
│   └── login/page.tsx                   # Login admin & trainer
│
├── admin/
│   ├── layout.tsx                        # Shell + sidebar admin
│   ├── page.tsx                          # Dashboard: stats + recent activity
│   │
│   ├── trainers/
│   │   ├── page.tsx                      # Daftar pelatih
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx                  # Detail + jadwal trainer
│   │       └── edit/page.tsx
│   │
│   ├── packages/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   │
│   ├── customers/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx                  # Detail + enrollment list
│   │       └── enrollments/new/page.tsx
│   │
│   ├── enrollments/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx                  # Detail + session list
│   │       └── sessions/new/page.tsx     # Propose sesi (Mode A)
│   │
│   ├── invoices/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx                 # Detail + verifikasi pembayaran
│   │
│   └── schedule/page.tsx                 # Kalender global semua trainer
│
└── trainer/
    ├── layout.tsx                         # Shell + nav trainer
    │                                      # Responsive: sidebar di desktop,
    │                                      # bottom nav di mobile browser
    ├── page.tsx                           # Dashboard: sesi hari ini + outstanding
    ├── schedule/page.tsx                  # Kalender sesi + availability (Mode B)
    ├── sessions/
    │   ├── page.tsx                       # Daftar sesi (upcoming, completed)
    │   └── [id]/
    │       ├── page.tsx                   # Detail sesi
    │       └── checkin/page.tsx           # Check-in/out: kamera upload + konfirmasi
    ├── availability/page.tsx              # Set slot mingguan
    ├── outstanding/page.tsx               # Outstanding pembayaran & pengajaran
    └── notifications/page.tsx            # Daftar notifikasi (in-app)
```

### Trainer Web — Catatan UX Penting

Karena trainer bisa akses dari mobile browser, layout `/trainer/*` harus:
- **Responsive mobile-first** — gunakan bottom navigation bar di mobile, sidebar di desktop
- Halaman check-in (`/trainer/sessions/[id]/checkin`) dioptimasi untuk portrait mobile:
  - Preview foto besar
  - Tombol "Ambil Foto" dan "Upload" yang mudah di-tap
  - Konfirmasi sebelum submit
- Realtime subscription aktif via Supabase Realtime (notifikasi booking baru muncul tanpa refresh)

### Landing Page (`app/page.tsx`)
Sections:
- Hero — headline + CTA "Mulai Sekarang" / "Hubungi Kami"
- Features — fitur untuk admin dan trainer
- How it works — 3 langkah simple
- Pricing — cards paket
- Testimonials
- Footer — kontak, sosmed, link download app (App Store + Play Store)

---

## Mobile App — Flutter Structure (`apps/mobile`)

```
lib/
├── main.dart
├── app.dart                    # GoRouter setup, Riverpod providers
│
├── core/
│   ├── supabase/               # Supabase client init
│   ├── theme/                  # Colors, typography, spacing
│   └── utils/                  # Date helpers, formatters, validators
│
├── features/
│   ├── auth/
│   │   ├── login_screen.dart
│   │   └── auth_provider.dart
│   │
│   ├── today/
│   │   ├── today_screen.dart   # Sesi hari ini + quick check-in button
│   │   └── today_provider.dart
│   │
│   ├── checkin/
│   │   ├── checkin_screen.dart # Kamera + preview + upload
│   │   ├── checkin_provider.dart
│   │   └── checkin_service.dart # Upload logic, compression
│   │
│   ├── schedule/
│   │   ├── schedule_screen.dart  # Kalender bulan (table_calendar)
│   │   ├── session_list.dart
│   │   ├── session_detail_screen.dart
│   │   └── approve_sheet.dart    # Bottom sheet approve/reject
│   │
│   ├── availability/
│   │   ├── availability_screen.dart  # Set slot mingguan
│   │   └── availability_provider.dart
│   │
│   ├── outstanding/
│   │   └── outstanding_screen.dart
│   │
│   └── notifications/
│       ├── notification_list_screen.dart
│       └── fcm_service.dart          # FCM init, token save ke profiles
│
└── shared/
    ├── widgets/                # Komponen reusable
    └── models/                 # Dart model classes (mirror dari types/)
```

### `pubspec.yaml` Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.0.0
  riverpod: ^2.0.0
  flutter_riverpod: ^2.0.0
  go_router: ^13.0.0
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  image_picker: ^1.0.0
  camera: ^0.10.0
  flutter_image_compress: ^2.0.0
  table_calendar: ^3.0.0
  intl: ^0.19.0
  cached_network_image: ^3.0.0
  flutter_local_notifications: ^17.0.0
```

### CheckIn Flow (Flutter) — Kritis

```dart
// checkin_service.dart
// 1. Buka kamera via image_picker (source: camera)
// 2. Kompres foto: max 800px width, JPEG quality 70 → target < 500KB
// 3. Upload ke Supabase Storage:
//    path: '{trainer_id}/{session_id}/check_in_{timestamp}.jpg'
// 4. Insert ke check_ins table:
//    - photo_url: path storage
//    - server_ts: tidak dikirim dari client → default now() dari DB
//    - trainer_id: dari auth.currentUser
// 5. Jika check_out & session complete → update session.status = 'completed'

// PENTING: server_ts SELALU dari server (DB default now())
// Jangan pernah kirim timestamp dari device — anti-fake
```

---

## Edge Functions (Supabase)

### `functions/send-push-notification/index.ts`

Dipanggil via database trigger (setelah insert ke `notifications`).
Ambil `fcm_token` dari `profiles`, kirim FCM push notification ke Flutter app.
Notifikasi in-app (web) ditangani via Supabase Realtime subscription — tidak perlu FCM untuk web.

```typescript
// Trigger: after insert on notifications
// Env vars: FIREBASE_SERVICE_ACCOUNT_JSON (FCM v1 API)
// Payload: { title, body, data: { type, session_id, ... } }
// Hanya kirim FCM jika profiles.fcm_token tidak null
```

### `functions/auto-invoice/index.ts`

Dipanggil ketika `enrollment.sessions_done = enrollment.sessions_total` dan `payment_type = 'postpaid'`.

```typescript
// 1. Generate invoice number dari sequence
// 2. Insert ke invoices (status: 'sent')
// 3. Insert notifikasi untuk admin
// 4. Trigger push notification
```

### Database Triggers untuk Otomasi

```sql
-- Trigger: setelah session completed, update sessions_done di enrollment
create or replace function on_session_completed()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    update enrollments
    set sessions_done = sessions_done + 1,
        updated_at = now()
    where id = new.enrollment_id;

    perform pg_notify('enrollment_check', new.enrollment_id::text);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_session_status_change
  after update on sessions
  for each row execute function on_session_completed();

-- Trigger: kirim notifikasi saat session proposed
create or replace function on_session_proposed()
returns trigger as $$
begin
  if new.status = 'proposed' then
    insert into notifications (user_id, type, title, body, data)
    values (
      new.trainer_id,
      'booking_proposed',
      'Permintaan Sesi Baru',
      'Ada permintaan sesi baru yang menunggu persetujuan kamu.',
      jsonb_build_object('session_id', new.id, 'enrollment_id', new.enrollment_id)
    );
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_session_insert
  after insert on sessions
  for each row execute function on_session_proposed();
```

---

## Shared Types (`packages/types`)

```typescript
// packages/types/src/index.ts

export type UserRole = 'admin' | 'trainer'
export type PaymentType = 'prepaid' | 'postpaid'
export type SessionStatus = 'proposed' | 'approved' | 'rejected' | 'completed' | 'cancelled' | 'missed'
export type BookingSource = 'customer_propose' | 'trainer_slot'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type PaymentStatus = 'pending' | 'verified' | 'rejected'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone?: string
  avatar_url?: string
  fcm_token?: string
  created_at: string
}

export interface Trainer {
  id: string
  specialty?: string
  bio?: string
  payment_type: PaymentType
  is_active: boolean
  profiles?: Profile
}

export interface Package {
  id: string
  name: string
  session_count: number
  duration_days: number
  price: number
  description?: string
  is_active: boolean
}

export interface Customer {
  id: string
  full_name: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}

export interface Enrollment {
  id: string
  customer_id: string
  trainer_id: string
  package_id: string
  payment_type: PaymentType
  status: 'active' | 'completed' | 'cancelled' | 'suspended'
  start_date: string
  end_date?: string
  sessions_total: number
  sessions_done: number
  customers?: Customer
  trainers?: Trainer
  packages?: Package
}

export interface Session {
  id: string
  enrollment_id: string
  trainer_id: string
  scheduled_date: string
  start_time: string
  end_time: string
  status: SessionStatus
  booking_source: BookingSource
  notes?: string
  rejection_reason?: string
  enrollments?: Enrollment
  check_ins?: CheckIn[]
}

export interface CheckIn {
  id: string
  session_id: string
  trainer_id: string
  type: 'check_in' | 'check_out'
  photo_url: string
  latitude?: number
  longitude?: number
  server_ts: string
}

export interface Invoice {
  id: string
  enrollment_id: string
  invoice_number: string
  amount: number
  status: InvoiceStatus
  due_date?: string
  enrollments?: Enrollment
  payments?: Payment[]
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  status: PaymentStatus
  proof_url?: string
  proof_uploaded_at?: string
  verified_at?: string
  rejection_reason?: string
}
```

---

## Environment Variables

### Web (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Flutter (`apps/mobile/lib/core/supabase/config.dart`)
```dart
const supabaseUrl = 'https://xxxx.supabase.co';
const supabaseAnonKey = 'your-anon-key';
// Jangan hardcode di source — pakai --dart-define atau flutter_dotenv
```

### Supabase Edge Functions
```
FIREBASE_SERVICE_ACCOUNT_JSON=   # FCM v1 API
```

---

## Urutan Eksekusi oleh Agent

Ikuti urutan fase ini secara ketat. Jangan lanjut ke fase berikutnya sebelum fase sebelumnya selesai dan tidak ada error.

### Phase 1 — Monorepo Setup
1. Init Turborepo: `npx create-turbo@latest`
2. Setup `apps/web` dengan Next.js 15: `npx create-next-app@latest`
3. Install Tailwind + shadcn/ui di `apps/web`
4. Init `packages/types` dengan TypeScript
5. Init Flutter project di `apps/mobile`: `flutter create mobile`
6. Init Supabase CLI: `supabase init`
7. Config `turbo.json` untuk build pipeline

### Phase 2 — Database & Backend
8. Tulis migration files 001–012 di `supabase/migrations/`
9. Jalankan: `supabase db push`
10. Setup RLS policies (semua tabel)
11. Setup Storage bucket `check-in-photos` + policies
12. Tulis `supabase/seed.sql` (dev data)
13. Jalankan seed: `supabase db seed`

### Phase 3 — Auth & Layout Web
14. Setup Supabase Auth SSR (`@supabase/ssr`) di Next.js
15. Buat `middleware.ts` untuk route protection (admin vs trainer)
16. Buat admin layout + sidebar
17. Buat trainer layout — sidebar di desktop, bottom nav di mobile (responsive)
18. Buat `/login` page

### Phase 4 — Landing Page
19. Buat `app/page.tsx` — Hero section
20. Features, How it works, Pricing sections
21. Testimonials + Footer (dengan link download App Store & Play Store)
22. Responsive & animasi (Framer Motion opsional)

### Phase 5 — Admin Features (Web)
23. Dashboard admin (stats cards + recent activity)
24. CRUD Trainers (list, create, edit, detail)
25. CRUD Packages
26. CRUD Customers
27. Enrollment creation flow
28. Session proposal — Mode A (customer propose via admin)
29. Kalender global (React Big Calendar, color-coded per status)
30. Invoice list + detail
31. Verifikasi bukti transfer (upload preview + approve/reject)

### Phase 6 — Trainer Features (Web) — Feature Complete
32. Dashboard trainer (sesi hari ini + outstanding)
33. Kalender trainer + set availability — Mode B
34. Approve/reject session (dengan alasan)
35. Halaman check-in (`/trainer/sessions/[id]/checkin`):
    - `<input type="file" accept="image/*" capture="environment">` untuk kamera
    - Client-side image compression (canvas) sebelum upload
    - Preview foto + konfirmasi sebelum submit
    - Feedback sukses/gagal yang jelas
36. Outstanding page (prepaid vs postpaid)
37. Halaman notifikasi in-app
38. Realtime subscription (Supabase Realtime) untuk notifikasi booking baru tanpa refresh

### Phase 7 — Edge Functions & Triggers
39. Edge Function `send-push-notification` (FCM, hanya jika fcm_token ada)
40. Edge Function `auto-invoice`
41. Database triggers (`on_session_completed`, `on_session_proposed`)

### Phase 8 — Flutter Mobile
42. Setup Supabase Flutter SDK + init di `main.dart`
43. Setup Firebase + FCM (`firebase_messaging`), simpan FCM token ke `profiles.fcm_token`
44. Setup GoRouter (routes + auth guard)
45. Setup Riverpod providers (auth, session, checkin)
46. Login screen
47. `TodayScreen` — sesi hari ini, quick action buttons
48. `CheckInScreen` — kamera native, kompres, upload, konfirmasi
49. `ScheduleScreen` — `table_calendar` + session list
50. `SessionDetailScreen` — detail + approve/reject bottom sheet
51. `AvailabilityScreen` — set slot mingguan
52. `OutstandingScreen`
53. `NotificationListScreen` + FCM foreground/background handler

### Phase 9 — Polish & Testing
54. Loading states + skeleton UI di semua halaman (web & Flutter)
55. Error handling + toast notifications
56. Form validation (Zod di web, Flutter form validators di mobile)
57. Optimistic updates untuk check-in
58. Responsive design audit — trainer web di mobile browser (320px–768px)
59. Flutter test di iOS Simulator + Android Emulator
60. Review semua RLS policy dengan test user berbeda role

---

## Dev Seed Data (`supabase/seed.sql`)

Buat data berikut untuk development:
- 1 admin user (`admin@trainerapp.dev` / `password123`)
- 3 trainer:
  - Budi (renang, prepaid) — `budi@trainerapp.dev` / `password123`
  - Sari (gym, postpaid) — `sari@trainerapp.dev` / `password123`
  - Andi (yoga, prepaid) — `andi@trainerapp.dev` / `password123`
- 3 package: Paket 4x, Paket 8x, Paket 12x
- 5 customer
- Enrollment untuk setiap customer (mix prepaid & postpaid)
- Sessions dengan mix status: proposed, approved, completed
- 1 invoice paid (prepaid), 1 invoice pending verifikasi, 1 invoice postpaid belum dibayar
- Check-in records untuk completed sessions

---

## Catatan Penting untuk Agent

**Trainer web adalah first-class citizen.** Bukan fallback — semua fitur trainer harus berfungsi penuh di web. Prioritaskan UX mobile browser di `/trainer/*` (touch targets besar, bottom nav, kamera via file input).

**Anti-fake timestamp:** `server_ts` pada `check_ins` selalu dari server (`default now()`). Client (web maupun Flutter) tidak boleh mengirim nilai timestamp — hanya kirim `session_id`, `photo_url`, dan koordinat GPS opsional.

**Foto check-in web:** Kompres di client-side sebelum upload menggunakan Canvas API (resize max 800px, convert ke JPEG quality 0.7). Target < 500KB. Gunakan signed URL (expire 1 jam) untuk preview.

**Foto check-in Flutter:** Kompres via `flutter_image_compress`. Target sama < 500KB.

**Booking window validation:** Validasi window check-in (`start_time ± 15 menit`) dilakukan di server via RLS check atau Edge Function, bukan hanya di client UI.

**Invoice numbering:** Gunakan PostgreSQL sequence (`invoice_number_seq`) untuk mencegah race condition pada nomor invoice.

**FCM hanya untuk Flutter:** Notifikasi push via FCM hanya dikirim jika `profiles.fcm_token` tidak null (artinya trainer sudah login via Flutter app). Trainer yang hanya pakai web mendapat notifikasi via Supabase Realtime subscription.

**FCM token refresh:** Setiap kali trainer login di Flutter, refresh dan simpan `fcm_token` terbaru ke `profiles` table.

**Flutter Dart models:** Buat Dart model class yang mirror TypeScript types di `packages/types`. Tidak bisa share langsung tapi harus konsisten secara struktur.

---

*Sportemu AGENT.md — v3.0 (Flutter + Next.js + Supabase, trainer web & mobile)*


---

## Changelog (Post-Implementation Updates)

### Design Changes
- **Primary color:** Changed from Cyan 500 to Ocean Blue (Sky 700, `#0369a1`)
- **Icon style:** Lucide React only, single color (sky-700/800), no emojis in dashboard
- **Landing page:** Iklanin les renang ke calon klien (bukan jualan platform SaaS)
- **Animations:** Framer Motion scroll-in animations + hover effects on landing page

### Schema Changes
- **`payment_type` moved to enrollment level** — removed from trainers table. Admin/trainer pilih saat bikin enrollment. Satu trainer bisa punya mix prepaid/postpaid klien.
- **New tables:** `specialties`, `trainer_specialties` (many-to-many), `cities`, `trainer_available_cities` (many-to-many)
- **`trainers` table:** Added `home_city_id`. `payment_type` deprecated (nullable).
- **`customers` table:** Added `city_id`
- **`enrollments` table:** Added `booking_token` (unique, for shareable calendar link)

### New Features (not in original spec)
- **Specialties & Cities** — dynamic, admin-managed via DB tables
- **Shareable Booking Calendar** (Mode D) — `/book/{booking_token}`, klien booking sendiri tanpa login
- **Trainer self-schedule** (Mode C) — trainer bisa input jadwal klien langsung
- **Auto-invoice prepaid** — invoice otomatis dibuat saat enrollment prepaid dibuat
- **City compatibility warning** — warning saat enrollment jika klien di luar area trainer

### Booking Modes (Updated)
- **Mode A:** Customer propose via admin → proposed → trainer approve
- **Mode B:** Trainer set availability slot → admin assign customer
- **Mode C:** Trainer input jadwal klien langsung → auto-approved
- **Mode D:** Klien self-booking via shareable calendar link → proposed → trainer approve

---

*Sportemu AGENT.md — v4.0 (Updated post-implementation)*
