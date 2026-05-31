# Business Logic & Rules

## SaaS Model

### Trainer Subscription
- Trainer signup sendiri dari landing page (email + password)
- Default: free tier (5 klien, 20 sesi/bulan)
- Upgrade: manual (admin approve) — Stripe integration nanti
- Subscription status: free, active, expired, cancelled

### Trainer Capabilities
- Manage klien sendiri (CRUD customers)
- Set paket & harga sendiri (CRUD packages)
- Manage jadwal & availability
- Bikin invoice sendiri ke klien
- Check-in/out dengan foto
- Share booking calendar ke klien

### Admin (Sportemu) Capabilities
- Lihat semua trainer subscribers
- Manage subscription plans & limits
- Approve/reject subscription upgrades
- View platform metrics (revenue, active trainers, total sessions)
- Configure free tier limits

### Freemium Limits (configurable by admin)
- Free: max 5 klien, max 20 sesi/bulan
- Pro: max 50 klien, max 500 sesi/bulan
- Enterprise: unlimited + multi-trainer (organization)
- Enforce via middleware/RLS — block create jika limit tercapai
- Show upgrade prompt saat limit hampir penuh

### Multi-Trainer (Enterprise)
- Enterprise trainer bisa buat "Organization"
- Undang pelatih lain ke organisasi (mereka ga perlu bayar sendiri)
- Owner bisa lihat data semua anggota tim
- Subscription Enterprise cover semua member
- Roles: owner, admin, trainer
- Database: `organizations` + `organization_members` tables

## Hybrid Booking Flow

### Mode A — Customer Propose (via Admin)
1. Admin buka enrollment → klik "Tambah Sesi" → input tanggal & jam
2. Session terbentuk: `status: 'proposed'`, `booking_source: 'customer_propose'`
3. Trainer dapat notifikasi Realtime (web) + FCM push (mobile)
4. Trainer approve → `status: 'approved'` / reject → `status: 'rejected'` + alasan
5. Trainer bisa approve/reject dari web maupun Flutter app

### Mode B — Trainer Set Slot
1. Trainer buka kalender (web atau Flutter) → tambah availability slot
2. Admin lihat slot kosong trainer di kalender global
3. Admin assign customer ke slot → Session langsung `status: 'approved'`

### Mode C — Trainer Input Jadwal Klien
1. Trainer buka halaman Sesi → klik "Tambah Sesi"
2. Pilih klien (dari enrollment aktif), input tanggal & jam
3. Session langsung `status: 'approved'`, `booking_source: 'trainer_slot'`
4. Berguna jika klien langsung hubungi trainer tanpa lewat admin

### Mode D — Klien Self-Booking (Shareable Calendar Link)
1. Setiap enrollment punya `booking_token` (random, unique)
2. Trainer/admin share link: `/book/{booking_token}` ke klien
3. Klien buka link (no login needed) → lihat:
   - Kalender dengan slot available trainer (hijau)
   - Jadwal klien sendiri yang sudah ada (warna mencolok, ring biru)
   - Slot yang sudah terisi (disabled)
4. Klien pilih tanggal & jam → session dibuat `status: 'proposed'`
5. Trainer dapet notifikasi → approve/reject
6. Link valid selama enrollment aktif, klien bisa lihat history jadwalnya

## Check-in / Check-out Rules

### Syarat Check-in
- `session.status = 'approved'`
- `scheduled_date = today`
- Jam sekarang dalam window: `start_time ± 15 menit`
- Belum ada record `check_in` untuk session ini

### Syarat Check-out
- `check_in` sudah ada untuk session ini
- Jam sekarang >= `end_time - 5 menit`

### Setelah Check-out Berhasil
- `session.status` → `'completed'`
- `enrollment.sessions_done` + 1
- Jika `sessions_done = sessions_total`:
  - `enrollment.status` → `'completed'`
  - Jika postpaid → trigger auto-invoice Edge Function

### Check-in: Web vs Mobile

**Web (trainer pakai browser):**
- Input foto via `<input type="file" accept="image/*" capture="environment">`
- Kompres client-side (Canvas API, resize max 800px, JPEG quality 0.7, target < 500KB)
- `server_ts` tetap dari server (DB default now())

**Mobile/Flutter:**
- Kamera native via `image_picker`
- Kompres via `flutter_image_compress`
- Upload ke Supabase Storage
- `server_ts` tetap dari server (DB default now())

## Payment Outstanding Logic

### PREPAID (bayar dulu, baru belajar)
- Admin/trainer pilih "prepaid" saat bikin enrollment
- Enrollment dibuat → Invoice dibuat (status: draft → sent)
- Admin input bukti transfer → `payment.status: pending`
- Admin verifikasi → `payment.status: verified` → enrollment aktif
- Outstanding admin: `sessions_done < sessions_total` (sesi belum dijalankan)

### POSTPAID (belajar dulu, bayar setelah paket habis)
- Admin/trainer pilih "postpaid" saat bikin enrollment
- Enrollment dibuat → langsung aktif, sesi bisa jalan
- Invoice otomatis dibuat saat enrollment completed
- Customer bayar → admin verifikasi bukti transfer
- Outstanding admin: invoice status `'sent'` / `'overdue'` belum dibayar
- Outstanding trainer: sesi completed tapi invoice belum paid

### Payment Type Rules
- `payment_type` ada di level enrollment, BUKAN di trainer
- Satu trainer bisa punya mix klien prepaid dan postpaid
- Admin dan trainer bisa pilih payment type saat bikin enrollment
- Klien tidak bisa memilih payment type (ditentukan admin/trainer)

## Edge Functions & Triggers

### `send-push-notification`
- Trigger: after insert on `notifications`
- Ambil `fcm_token` dari `profiles`, kirim FCM push
- Hanya kirim jika `fcm_token` tidak null

### `auto-invoice`
- Trigger: `enrollment.sessions_done = sessions_total` dan `payment_type = 'postpaid'`
- Generate invoice number dari sequence
- Insert invoice (status: 'sent')
- Insert notifikasi untuk admin

### Database Triggers
- `on_session_completed` — update `sessions_done` di enrollment setelah session completed
- `on_session_proposed` — kirim notifikasi ke trainer saat session proposed
