# Execution Phases

Ikuti urutan fase ini secara ketat. Jangan lanjut ke fase berikutnya sebelum fase sebelumnya selesai dan tidak ada error.

## Phase 1 — Monorepo Setup
1. Init Turborepo: `npx create-turbo@latest`
2. Setup `apps/web` dengan Next.js 15: `npx create-next-app@latest`
3. Install Tailwind + shadcn/ui di `apps/web`
4. Init `packages/types` dengan TypeScript
5. Init Flutter project di `apps/mobile`: `flutter create mobile`
6. Init Supabase CLI: `supabase init`
7. Config `turbo.json` untuk build pipeline

## Phase 2 — Database & Backend
8. Tulis migration files 001–012 di `supabase/migrations/`
9. Jalankan: `supabase db push`
10. Setup RLS policies (semua tabel)
11. Setup Storage bucket `check-in-photos` + policies
12. Tulis `supabase/seed.sql` (dev data)
13. Jalankan seed: `supabase db seed`

## Phase 3 — Auth & Layout Web
14. Setup Supabase Auth SSR (`@supabase/ssr`) di Next.js
15. Buat `middleware.ts` untuk route protection (admin vs trainer)
16. Buat admin layout + sidebar
17. Buat trainer layout — sidebar di desktop, bottom nav di mobile (responsive)
18. Buat `/login` page

## Phase 4 — Landing Page
19. Buat `app/page.tsx` — Hero section
20. Features, How it works, Pricing sections
21. Testimonials + Footer (dengan link download App Store & Play Store)
22. Responsive & animasi (Framer Motion opsional)

## Phase 5 — Admin Features (Web)
23. Dashboard admin (stats cards + recent activity)
24. CRUD Trainers (list, create, edit, detail)
25. CRUD Packages
26. CRUD Customers
27. Enrollment creation flow
28. Session proposal — Mode A (customer propose via admin)
29. Kalender global (React Big Calendar, color-coded per status)
30. Invoice list + detail
31. Verifikasi bukti transfer (upload preview + approve/reject)

## Phase 6 — Trainer Features (Web) — Feature Complete
32. Dashboard trainer (sesi hari ini + outstanding)
33. Kalender trainer + set availability — Mode B
34. Approve/reject session (dengan alasan)
35. Halaman check-in:
    - `<input type="file" accept="image/*" capture="environment">` untuk kamera
    - Client-side image compression (canvas) sebelum upload
    - Preview foto + konfirmasi sebelum submit
    - Feedback sukses/gagal yang jelas
36. Outstanding page (prepaid vs postpaid)
37. Halaman notifikasi in-app
38. Realtime subscription (Supabase Realtime) untuk notifikasi booking baru

## Phase 7 — Edge Functions & Triggers
39. Edge Function `send-push-notification` (FCM, hanya jika fcm_token ada)
40. Edge Function `auto-invoice`
41. Database triggers (`on_session_completed`, `on_session_proposed`)

## Phase 8 — Flutter Mobile
42. Setup Supabase Flutter SDK + init di `main.dart`
43. Setup Firebase + FCM, simpan FCM token ke `profiles.fcm_token`
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

## Phase 9 — Polish & Testing
54. Loading states + skeleton UI di semua halaman (web & Flutter)
55. Error handling + toast notifications
56. Form validation (Zod di web, Flutter form validators di mobile)
57. Optimistic updates untuk check-in
58. Responsive design audit — trainer web di mobile browser (320px–768px)
59. Flutter test di iOS Simulator + Android Emulator
60. Review semua RLS policy dengan test user berbeda role

## Dev Seed Data

Buat data berikut untuk development:
- 1 admin user (`admin@trainerapp.dev` / `password123`)
- 3 trainer: Budi (renang, prepaid), Sari (gym, postpaid), Andi (yoga, prepaid)
- 3 package: Paket 4x, Paket 8x, Paket 12x
- 5 customer
- Enrollment untuk setiap customer (mix prepaid & postpaid)
- Sessions dengan mix status: proposed, approved, completed
- 1 invoice paid, 1 invoice pending verifikasi, 1 invoice postpaid belum dibayar
- Check-in records untuk completed sessions
