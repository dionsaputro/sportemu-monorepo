# Coding Conventions & Guidelines

## General Rules

- Ikuti urutan fase eksekusi secara ketat — jangan lanjut ke fase berikutnya sebelum fase sebelumnya selesai dan tidak ada error
- Trainer web adalah first-class citizen — semua fitur trainer harus berfungsi penuh di web
- Prioritaskan UX mobile browser di `/trainer/*` (touch targets besar, bottom nav, kamera via file input)

## Anti-Fake & Security

- `server_ts` pada `check_ins` SELALU dari server (`default now()`). Client tidak boleh mengirim timestamp
- Booking window validation (`start_time ± 15 menit`) dilakukan di server via RLS/Edge Function, bukan hanya client
- Invoice numbering via PostgreSQL sequence — anti race condition
- Gunakan signed URL (expire 1 jam) untuk preview foto, jangan simpan public URL

## Web (Next.js)

- Gunakan App Router + Server Components sebagai default
- Tailwind CSS + shadcn/ui untuk semua komponen UI
- React Hook Form + Zod untuk form validation
- Zustand untuk client state, React Query untuk server sync
- TanStack Table untuk data tables
- Middleware untuk route protection (admin vs trainer)
- Responsive mobile-first pada `/trainer/*` — bottom nav di mobile, sidebar di desktop

## Flutter

- Riverpod untuk state management
- GoRouter untuk navigation + auth guard
- Dart model classes harus mirror TypeScript types di `packages/types` (konsisten secara struktur)
- `image_picker` untuk kamera, `flutter_image_compress` untuk kompresi
- Simpan FCM token ke `profiles.fcm_token` setiap login
- Gunakan `--dart-define` atau `flutter_dotenv` untuk env vars, jangan hardcode
- Development testing dilakukan di browser (`flutter run -d chrome`), bukan emulator
- Platform: web only untuk saat ini (android/ios ditambahkan nanti)

## Supabase

- Semua tabel harus punya RLS enabled
- Admin: full access ke semua tabel
- Trainer: akses terbatas ke data sendiri
- Edge Functions ditulis dalam Deno/TypeScript
- Realtime subscription untuk notifikasi web (bukan FCM)

## File & Image Handling

- Foto check-in: kompres sebelum upload (max 800px, JPEG quality 0.7, target < 500KB)
- Storage path: `{trainer_id}/{session_id}/check_in_{unix_ts}.jpg`
- Web: Canvas API untuk kompresi
- Flutter: `flutter_image_compress`

## Shared Types (`packages/types`)

- Semua TypeScript types dan Zod schemas di sini
- Digunakan oleh `apps/web`
- Flutter models harus konsisten secara struktur (tapi tidak bisa share langsung)
