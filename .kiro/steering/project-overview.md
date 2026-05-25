# Sportemu — Project Overview

## Ringkasan

Aplikasi manajemen pelatih privat (renang, gym, dll) dengan tiga aktor:
- **Admin** — input semua data, kelola pelatih, paket, customer, invoice
- **Trainer** — kelola jadwal, check-in/out dengan foto, lihat outstanding
- **Customer** — tidak punya login; semua interaksi diwakilkan admin

Platform: Web (Next.js 15) + Mobile (Flutter), backend Supabase.

Trainer dapat menggunakan web atau mobile — keduanya feature-complete. Flutter adalah pilihan utama (experience lebih baik untuk check-in foto via kamera native), tapi web trainer dashboard berfungsi penuh sebagai alternatif.

## Monorepo Structure (Turborepo)

```
trainerapp/
├── apps/
│   ├── web/                  # Next.js 15 — landing page + admin + trainer dashboard
│   └── mobile/               # Flutter — trainer app (iOS & Android)
├── packages/
│   └── types/                # Shared TypeScript types & Zod schemas
├── supabase/
│   ├── migrations/           # SQL migration files (001–012)
│   ├── seed.sql              # Dev seed data
│   └── functions/            # Edge Functions (Deno)
├── turbo.json
└── package.json
```

## Key Principles

- Trainer web adalah first-class citizen — bukan fallback
- Anti-fake timestamp: `server_ts` pada `check_ins` selalu dari server (`default now()`)
- Foto check-in dikompres client-side (max 800px, JPEG quality 0.7, target < 500KB)
- Booking window validation dilakukan di server, bukan hanya client
- Invoice numbering via PostgreSQL sequence (anti race condition)
- FCM hanya untuk Flutter; web pakai Supabase Realtime
