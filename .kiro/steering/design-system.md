# Design System

## Brand & Color

Sportemu fokus di pelatihan renang — visual identity menggunakan warna kolam renang (cyan/turquoise).

### Primary Color
- **Ocean Blue (Sky 700):** `#0369a1` — used for active states, buttons, accents
- **Sky 900:** `#0c4a6e` — used for headings, bold text
- **Sky 100:** `#e0f2fe` — used for icon backgrounds, subtle highlights
- Flutter seed color: `Color(0xFF0369A1)`

### Icon Style
- Lucide React icons only (no emojis in UI)
- Single color: sky-800 / sky-700 (ocean blue family)
- Consistent 4-5px size in navigation, smaller in tables

### Color Palette (Light Mode)
- Background: white
- Foreground: dark cyan-tinted gray
- Primary: cyan 500
- Secondary: light cyan tint
- Muted: soft gray with cyan undertone
- Destructive: red (untuk delete, error)
- Border: light cyan-gray

### Color Palette (Dark Mode)
- Background: very dark cyan-gray
- Primary: brighter cyan (50% lightness)
- Cards: slightly lighter than background
- Borders: subtle cyan-gray

## Typography
- **Web:** Inter (Google Fonts)
- **Flutter:** System default (Material 3)
- Headings: bold, tight letter-spacing
- Body: regular weight, comfortable line-height

## Component Style
- **Framework:** shadcn/ui (web), Material 3 (Flutter)
- Border radius: 0.5rem (8px)
- Buttons: full-width on mobile, auto-width on desktop
- Cards: subtle border, no heavy shadows
- Forms: outlined inputs with clear labels

## Layout Principles
- Admin: sidebar navigation (desktop), collapsible on tablet
- Trainer web: sidebar on desktop, bottom nav on mobile browser
- Flutter: bottom navigation bar
- Mobile-first responsive design on trainer routes
- Touch targets minimum 44x44px on mobile

## Vibe
- **Clean tapi sporty & energetic** — tidak kaku, menyenangkan diliat
- Warna cyan memberikan kesan segar dan aquatic
- Boleh pakai elemen dekoratif ringan (subtle gradients, rounded shapes, micro-interactions)
- Skeleton loading states untuk perceived performance
- Gunakan emoji atau icon yang playful di dashboard/empty states
- Tone copywriting: casual, friendly, pakai bahasa Indonesia sehari-hari

## Assets & Resources
- **Icons:** Lucide Icons (web), Material Icons (Flutter) — boleh tambah icon pack lain jika perlu
- **Ilustrasi:** Boleh pakai free stock illustrations (undraw.co, storyset.com, dll) untuk empty states, onboarding, landing page
- **Gambar:** Unsplash/Pexels untuk hero images dan background (tema: swimming, fitness, water)
- **Micro-interactions:** Subtle animations pada button hover, page transitions, success states
- **Empty states:** Jangan kosong — selalu ada ilustrasi + pesan yang friendly & encouraging

## Tone & Personality
- App terasa seperti teman yang bantu manage jadwal, bukan software enterprise
- Greeting di dashboard: "Halo, Budi! 🏊‍♂️ Ada 2 sesi hari ini"
- Success messages yang fun: "Check-in berhasil! 💪"
- Error messages yang helpful, bukan menakutkan
