# 🏊 Sportemu

**Platform SaaS untuk pelatih olahraga independen.**

Kelola klien, jadwal, invoice, dan check-in dalam satu tempat. Fokus melatih, biar Sportemu yang urus administrasinya.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS, shadcn/ui, Framer Motion |
| Mobile | Flutter (web-first, iOS/Android later) |
| Backend | Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions) |
| Monorepo | Turborepo |
| Language | TypeScript, Dart |

## Project Structure

```
sportemu/
├── apps/
│   ├── web/              # Next.js 15 — landing, admin, trainer dashboard
│   └── mobile/           # Flutter — trainer mobile app
├── packages/
│   └── types/            # Shared TypeScript types & Zod schemas
├── supabase/
│   ├── migrations/       # 19 SQL migration files
│   ├── functions/        # Edge Functions (push notification, auto-invoice)
│   └── config.toml
├── scripts/
│   ├── seed.mjs          # Original seed (admin-managed model)
│   └── seed-saas.mjs     # SaaS seed (trainer as customer)
└── .kiro/steering/       # AI steering files (project context)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 10+
- Supabase CLI (`brew install supabase/tap/supabase`)
- Flutter SDK (optional, for mobile)

### Setup

```bash
# Clone
git clone https://github.com/dionsaputro/sportemu-monorepo.git
cd sportemu-monorepo

# Install dependencies
npm install

# Setup environment
cp apps/web/.env.local.example apps/web/.env.local
# Fill in your Supabase URL and keys

# Link Supabase project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push

# Seed data
node scripts/seed-saas.mjs

# Run dev server
npm run dev
```

### Environment Variables

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Features

### For Trainers (Paying Customers)
- ✅ Self-signup (freemium)
- ✅ Manage clients
- ✅ Create packages & set pricing
- ✅ Manage enrollments
- ✅ Schedule & availability management
- ✅ Shareable booking calendar (Calendly-style)
- ✅ Session approve/reject
- ✅ Check-in/out with photo (anti-fake timestamp)
- ✅ Invoice management (auto-generate)
- ✅ Outstanding tracking (prepaid/postpaid)
- ✅ In-app notifications

### For Admin (Platform)
- ✅ Subscriber management
- ✅ Subscription plans (Free/Pro/Enterprise)
- ✅ Platform metrics & revenue

### Public
- ✅ Landing page (SaaS pitch)
- ✅ Booking page per enrollment (no login required)

## Business Model

| Plan | Price | Clients | Sessions/mo |
|------|-------|---------|-------------|
| Free | Rp 0 | 5 | 20 |
| Pro | Rp 199.000/bln | 50 | 500 |
| Enterprise | Rp 499.000/bln | Unlimited | Unlimited |

## Test Accounts

After running `seed-saas.mjs`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@trainerapp.dev | password123 |
| Trainer | trainer@test.dev | password123 |

## Development

```bash
# Run web dev server
npm run dev

# Build
npm run build

# Type check
npm run type-check

# Flutter (web)
cd apps/mobile && flutter run -d chrome
```

## Database

19 migrations covering:
- User profiles & roles
- Trainers, specialties, cities
- Packages, customers, enrollments
- Sessions, check-ins
- Invoices, payments
- Notifications
- Subscription plans
- RLS policies (row-level security)
- Storage (check-in photos)
- Triggers (auto-notification, auto-invoice)

## License

Private — All rights reserved.
