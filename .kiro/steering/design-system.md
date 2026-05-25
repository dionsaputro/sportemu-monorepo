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
- Admin: sidebar navigation (desktop), 240px width, ocean blue active state
- Trainer web: sidebar on desktop (hidden md:flex), bottom nav on mobile (fixed bottom, md:hidden)
- Flutter: bottom navigation bar
- Mobile-first responsive design on trainer routes
- Touch targets minimum 44x44px on mobile
- Dashboard: max-w-6xl content area, bg-[#FAFBFC] background
- Landing page: max-w-6xl, full-width sections with alternating bg (white/slate-50)

## Vibe
- **Clean tapi sporty & energetic** — tidak kaku, menyenangkan diliat
- Warna ocean blue memberikan kesan segar dan aquatic
- Scroll-in animations (fade + slide up) via Framer Motion
- Hover effects pada cards (scale, shadow, border color change)
- Skeleton loading states untuk perceived performance
- Tone copywriting: casual, friendly, pakai bahasa Indonesia sehari-hari

## Assets & Resources
- **Icons:** Lucide React — single color (sky-700/sky-800), consistent sizing
- **Ilustrasi:** Unsplash photos untuk landing page (tema: swimming, pool, coaching, fitness)
- **Gambar pelatih:** Unsplash portraits (placeholder, ganti dengan foto asli nanti)
- **Animations:** Framer Motion — scroll-triggered fade-in, floating cards, counter animations
- **Empty states:** Lucide icon + helpful text, no emojis in dashboard UI

## Tone & Personality
- App terasa seperti teman yang bantu manage jadwal, bukan software enterprise
- Landing page: iklanin les renang ke calon klien (bukan jualan platform SaaS)
- Dashboard: clean, data-focused, minimal decorative elements
- Success messages yang fun: "Check-in berhasil! 💪" (emoji OK di toast/notification)
- Error messages yang helpful, bukan menakutkan

## Landing Page
- Target audience: calon klien yang mau les renang/olahraga
- Hero: foto kolam + headline + CTA (WhatsApp + lihat paket)
- Sections: Kenapa Kami, Cara Kerja, Pelatih, Paket, Testimoni, CTA/Kontak
- Semua section punya scroll animation
- Cards dengan foto dari Unsplash, hover zoom effect
- Pricing cards dengan "Paling Populer" badge
- CTA mengarah ke WhatsApp (bukan signup form)
- Login pelatih ada tapi subtle (navbar kanan)
