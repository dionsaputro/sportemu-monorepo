# Sportemu — Project Overview

## Business Model: SaaS for Sports Coaches

Sportemu adalah platform SaaS untuk pelatih olahraga independen (renang, gym, yoga, dll).

### Aktor:
- **Super Admin (Sportemu)** — kelola subscribers, billing, platform config
- **Trainer** — paying customer. Full control: manage klien, paket, jadwal, invoice, check-in
- **Klien** — murid si trainer. Tidak punya login, booking via shareable link

### Revenue:
- Trainer bayar subscription ke Sportemu (freemium model)
- Free: 5 klien, 20 sesi/bulan (configurable)
- Paid: unlimited (manual billing dulu, Stripe nanti)

### Key Difference from Before:
- SEBELUM: Admin kelola semua, trainer cuma execute
- SEKARANG: Trainer kelola sendiri, admin cuma kelola platform & subscribers

## Multi-tenant Strategy
- **MVP (sekarang):** Single database, filtered by `trainer_id`
- **Scale (nanti):** Row-level tenant isolation atau separate schemas
- Semua query HARUS filter by trainer_id (kecuali admin)
- Pastikan RLS enforce tenant isolation

## Monorepo Structure (Turborepo)

```
trainerapp/
├── apps/
│   ├── web/                  # Next.js 15 — landing page + admin + trainer dashboard
│   └── mobile/               # Flutter — trainer app (iOS & Android)
├── packages/
│   └── types/                # Shared TypeScript types & Zod schemas
├── supabase/
│   ├── migrations/           # SQL migration files
│   ├── seed.sql              # Dev seed data
│   └── functions/            # Edge Functions (Deno)
├── turbo.json
└── package.json
```

## Key Principles

- Trainer adalah first-class citizen — mereka paying customer
- Trainer punya full control atas bisnis mereka (klien, paket, harga, jadwal)
- Admin (Sportemu) hanya kelola platform, subscribers, dan billing
- Anti-fake timestamp: `server_ts` pada `check_ins` selalu dari server
- Foto check-in dikompres client-side (max 800px, JPEG quality 0.7, target < 500KB)
- Booking window validation dilakukan di server
- Landing page: jualan platform ke trainer ("Kelola bisnis pelatihan kamu lebih mudah")
- Freemium: enforce limits via database/middleware
