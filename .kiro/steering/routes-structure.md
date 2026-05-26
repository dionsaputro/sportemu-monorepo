# Route Structure

## Web App Routes (`apps/web`)

```
app/
├── page.tsx                              # Landing page — jualan SaaS ke trainer
├── pricing/page.tsx                      # Pricing plans (free vs paid)
│
├── (auth)/
│   ├── login/page.tsx                   # Login trainer & admin
│   └── signup/page.tsx                  # Trainer self-signup (freemium)
│
├── admin/                                # Super Admin (Sportemu platform)
│   ├── layout.tsx
│   ├── page.tsx                          # Dashboard: subscriber metrics, revenue
│   ├── trainers/                         # Manage trainer subscribers
│   │   ├── page.tsx                      # List all trainers + subscription status
│   │   └── [id]/page.tsx                 # Trainer detail + subscription management
│   ├── plans/                            # Subscription plans config
│   │   └── page.tsx                      # Manage plans & limits
│   └── settings/page.tsx                 # Platform settings
│
├── trainer/                              # Trainer dashboard (paying customer)
│   ├── layout.tsx
│   ├── page.tsx                          # Dashboard: sesi hari ini, calendar, share links
│   ├── clients/                          # Manage klien (was: customers)
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx
│   ├── packages/                         # Manage paket & harga sendiri
│   │   ├── page.tsx
│   │   └── new/page.tsx
│   ├── enrollments/                      # Manage enrollment klien ke paket
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── sessions/new/page.tsx
│   ├── schedule/page.tsx                 # Kalender sesi
│   ├── sessions/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx
│   │       └── checkin/page.tsx
│   ├── availability/page.tsx             # Set slot mingguan
│   ├── invoices/page.tsx                 # Invoice ke klien
│   ├── outstanding/page.tsx
│   ├── notifications/page.tsx
│   └── settings/page.tsx                 # Trainer profile & subscription info
│
└── book/[token]/page.tsx                 # Public booking page (klien, no login)
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
