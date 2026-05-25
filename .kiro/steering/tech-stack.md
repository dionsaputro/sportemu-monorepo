# Tech Stack & Dependencies

## Web App (`apps/web`)

- **Framework:** Next.js 15 (App Router, Server Components)
- **UI:** Tailwind CSS + shadcn/ui
- **Auth:** Supabase Auth SSR (`@supabase/ssr`)
- **State:** Zustand (client), React Query (server sync)
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table
- **Calendar:** date-fns + React Big Calendar
- **File upload:** Supabase Storage SDK
- **Landing page:** Framer Motion untuk scroll animations + hover effects
- **Check-in web:** `<input type="file" accept="image/*" capture="environment">`

## Mobile App (`apps/mobile`)

- **Framework:** Flutter (latest stable)
- **Backend SDK:** `supabase_flutter`
- **Auth:** Supabase Auth (email/password)
- **Camera:** `image_picker` + `camera` package
- **Push Notifications:** Firebase Cloud Messaging via `firebase_messaging`
- **State management:** Riverpod
- **Navigation:** GoRouter
- **Calendar UI:** `table_calendar`
- **Image compression:** `flutter_image_compress`

### Flutter Dependencies (`pubspec.yaml`)

```yaml
dependencies:
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

## Backend (Supabase)

- **Database:** PostgreSQL 15
- **Auth:** Supabase Auth (JWT + RLS)
- **Storage:** Bucket `check-in-photos` (private)
- **Realtime:** Notifikasi booking baru ke trainer (web & mobile)
- **Edge Functions:** Deno — push notification trigger, auto invoice

## Environment Variables

### Web (`apps/web/.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

### Flutter (`apps/mobile`)
Gunakan `--dart-define` atau `flutter_dotenv`, jangan hardcode.

### Supabase Edge Functions
```
FIREBASE_SERVICE_ACCOUNT_JSON=
```
