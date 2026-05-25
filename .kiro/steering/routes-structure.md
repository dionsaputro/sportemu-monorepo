# Route Structure

## Web App Routes (`apps/web`)

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
│   ├── trainers/
│   │   ├── page.tsx                      # Daftar pelatih
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx                  # Detail + jadwal trainer
│   │       └── edit/page.tsx
│   ├── packages/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── customers/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx                  # Detail + enrollment list
│   │       └── enrollments/new/page.tsx
│   ├── enrollments/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       ├── page.tsx                  # Detail + session list
│   │       └── sessions/new/page.tsx     # Propose sesi (Mode A)
│   ├── invoices/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx                 # Detail + verifikasi pembayaran
│   └── schedule/page.tsx                 # Kalender global semua trainer
│
└── trainer/
    ├── layout.tsx                         # Shell + nav (sidebar desktop, bottom nav mobile)
    ├── page.tsx                           # Dashboard: sesi hari ini + outstanding
    ├── schedule/page.tsx                  # Kalender sesi + availability
    ├── sessions/
    │   ├── page.tsx                       # Daftar sesi (upcoming, completed)
    │   └── [id]/
    │       ├── page.tsx                   # Detail sesi
    │       └── checkin/page.tsx           # Check-in/out: kamera + konfirmasi
    ├── availability/page.tsx              # Set slot mingguan
    ├── outstanding/page.tsx               # Outstanding pembayaran & pengajaran
    └── notifications/page.tsx            # Daftar notifikasi (in-app)
```

## Flutter Structure (`apps/mobile/lib/`)

```
lib/
├── main.dart
├── app.dart                    # GoRouter setup, Riverpod providers
├── core/
│   ├── supabase/               # Supabase client init
│   ├── theme/                  # Colors, typography, spacing
│   └── utils/                  # Date helpers, formatters, validators
├── features/
│   ├── auth/                   # Login screen + auth provider
│   ├── today/                  # Sesi hari ini + quick check-in button
│   ├── checkin/                # Kamera + preview + upload
│   ├── schedule/               # Kalender + session list + approve/reject
│   ├── availability/           # Set slot mingguan
│   ├── outstanding/            # Outstanding screen
│   └── notifications/          # Notification list + FCM service
└── shared/
    ├── widgets/                # Komponen reusable
    └── models/                 # Dart model classes
```

## Landing Page Sections
- Navbar — fixed, blur backdrop, logo + nav + "Login Pelatih" + "Daftar Les" CTA
- Hero — split layout (text left, foto kolam right), floating animated cards, trust badges
- Stats bar — counter animations (pelatih, murid, sesi, rating)
- Kenapa Sportemu — 6 cards dengan foto Unsplash, hover zoom
- Cara Kerja — 3 steps dengan gradient numbered badges
- Pelatih — profil cards dengan foto, specialty, area
- Paket Les — 3 pricing cards (Starter/Reguler/Intensif), "Paling Populer" badge
- Testimoni — 6 review cards dengan star rating
- CTA/Kontak — gradient section, WhatsApp + email
- Footer — 4-column (brand, menu, kontak, copyright)

## Trainer Web UX Notes
- Layout `/trainer/*` harus responsive mobile-first
- Bottom navigation bar di mobile, sidebar di desktop
- Halaman check-in dioptimasi untuk portrait mobile (preview foto besar, tombol mudah di-tap)
- Realtime subscription aktif (notifikasi tanpa refresh)
