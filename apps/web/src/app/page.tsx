import Link from 'next/link'
import { Waves, Calendar, MapPin, Star, Users, CheckCircle2, ArrowRight, Clock, Phone } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-700">
              <Waves className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-sky-900">Sportemu</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#kenapa" className="text-sm text-slate-600 hover:text-sky-700">Kenapa Sportemu</a>
            <a href="#pelatih" className="text-sm text-slate-600 hover:text-sky-700">Pelatih</a>
            <a href="#paket" className="text-sm text-slate-600 hover:text-sky-700">Paket</a>
            <a href="#kontak" className="text-sm text-slate-600 hover:text-sky-700">Kontak</a>
          </div>
          <Link
            href="/login"
            className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-medium text-white hover:bg-sky-800"
          >
            Login Pelatih
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-14">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/80 to-white" />
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-sky-100/40 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-24 md:pt-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5">
              <Waves className="h-3.5 w-3.5 text-sky-600" />
              <span className="text-xs font-medium text-sky-700">Les renang & olahraga privat terpercaya</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-sky-900 md:text-5xl lg:text-6xl">
              Mau belajar renang?<br className="hidden md:block" />
              <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">
                Pelatih terbaik
              </span>{' '}
              siap bantu kamu.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base text-slate-600 md:text-lg">
              Les renang privat untuk anak & dewasa. Pelatih berpengalaman, jadwal fleksibel, lokasi sesuai keinginan kamu.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="#paket"
                className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 hover:bg-sky-800"
              >
                Lihat Paket Les
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#kontak"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Phone className="h-4 w-4" />
                Hubungi Kami
              </a>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 text-amber-400" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-sky-500" />
                <span>500+ murid</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Pelatih bersertifikat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa Sportemu */}
      <section id="kenapa" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-sky-900 md:text-3xl">Kenapa les di Sportemu?</h2>
            <p className="mt-3 text-sm text-slate-600">
              Bukan les biasa — kami pastikan pengalaman belajar kamu nyaman dan efektif.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Star, title: 'Pelatih Berpengalaman', desc: 'Semua pelatih kami bersertifikat dan punya pengalaman minimal 3 tahun mengajar.' },
              { icon: Calendar, title: 'Jadwal Fleksibel', desc: 'Pilih sendiri hari dan jam latihan yang cocok. Booking online, tanpa ribet.' },
              { icon: MapPin, title: 'Lokasi Sesuai Kamu', desc: 'Pelatih datang ke kolam renang terdekat dari lokasi kamu. Jabodetabek covered.' },
              { icon: Users, title: 'Privat 1-on-1', desc: 'Fokus penuh ke kamu. Belajar lebih cepat dibanding kelas grup.' },
              { icon: Clock, title: 'Progress Terukur', desc: 'Setiap sesi tercatat. Kamu bisa lihat perkembangan dari waktu ke waktu.' },
              { icon: Waves, title: 'Untuk Semua Level', desc: 'Dari yang takut air sampai mau improve teknik. Anak-anak dan dewasa.' },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="rounded-2xl border border-slate-100 p-6 transition-shadow hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                    <Icon className="h-5 w-5 text-sky-700" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-sky-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pelatih */}
      <section id="pelatih" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-sky-900 md:text-3xl">Pelatih Kami</h2>
            <p className="mt-3 text-sm text-slate-600">Tim pelatih profesional yang siap bantu kamu.</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Budi Santoso', specialty: 'Renang', exp: '5 tahun', area: 'Jakarta Selatan', desc: 'Spesialis teknik freestyle & butterfly. Sabar mengajar pemula.' },
              { name: 'Sari Dewi', specialty: 'Yoga & Renang', exp: '4 tahun', area: 'Jakarta Pusat', desc: 'Kombinasi yoga dan renang untuk relaksasi dan kebugaran.' },
              { name: 'Andi Pratama', specialty: 'Renang Anak', exp: '6 tahun', area: 'Tangerang', desc: 'Ahli mengajar anak-anak. Pendekatan fun dan aman.' },
            ].map((trainer) => (
              <div key={trainer.name} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-700 text-sm font-bold text-white">
                    {trainer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sky-900">{trainer.name}</p>
                    <p className="text-xs text-slate-500">{trainer.specialty}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-600">{trainer.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-medium text-sky-700">
                    {trainer.exp} pengalaman
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                    {trainer.area}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Paket */}
      <section id="paket" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-sky-900 md:text-3xl">Paket Les</h2>
            <p className="mt-3 text-sm text-slate-600">Pilih paket yang sesuai kebutuhan dan budget kamu.</p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Paket Coba', sessions: 4, price: 'Rp 800.000', period: '/bulan', desc: 'Cocok buat yang mau coba dulu', popular: false },
              { name: 'Paket Reguler', sessions: 8, price: 'Rp 1.400.000', period: '/bulan', desc: 'Paling populer — 2x seminggu', popular: true },
              { name: 'Paket Intensif', sessions: 12, price: 'Rp 1.800.000', period: '/bulan', desc: 'Buat yang mau progress cepat', popular: false },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl border p-6 ${
                  pkg.popular
                    ? 'border-sky-200 bg-sky-50/50 ring-1 ring-sky-200'
                    : 'border-slate-200'
                }`}
              >
                {pkg.popular && (
                  <span className="mb-3 inline-block rounded-full bg-sky-700 px-3 py-0.5 text-[10px] font-semibold text-white">
                    Paling Populer
                  </span>
                )}
                <h3 className="text-lg font-bold text-sky-900">{pkg.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{pkg.desc}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-sky-900">{pkg.price}</span>
                  <span className="text-sm text-slate-500">{pkg.period}</span>
                </div>
                <ul className="mt-5 space-y-2.5">
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                    {pkg.sessions} sesi privat
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                    Pelatih bersertifikat
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                    Jadwal fleksibel
                  </li>
                  <li className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-sky-600" />
                    Booking online
                  </li>
                </ul>
                <a
                  href="#kontak"
                  className={`mt-6 block rounded-xl py-2.5 text-center text-sm font-medium ${
                    pkg.popular
                      ? 'bg-sky-700 text-white hover:bg-sky-800'
                      : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Daftar Sekarang
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold text-sky-900 md:text-3xl">Kata Murid Kami</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Rini W.', text: 'Anak saya awalnya takut air, sekarang udah bisa renang sendiri setelah 2 bulan les. Coach Budi sabar banget.' },
              { name: 'Dedi K.', text: 'Booking jadwal gampang, tinggal klik link. Pelatihnya on time dan profesional.' },
              { name: 'Maya S.', text: 'Saya belajar renang di usia 30 tahun. Ga pernah nyangka bisa secepat ini. Terima kasih Sportemu!' },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600">&ldquo;{t.text}&rdquo;</p>
                <p className="mt-4 text-xs font-semibold text-sky-900">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Kontak */}
      <section id="kontak" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl bg-gradient-to-br from-sky-700 to-sky-900 p-12 text-center md:p-16">
            <h2 className="text-2xl font-bold text-white md:text-3xl">
              Siap mulai belajar renang?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm text-sky-100">
              Hubungi kami untuk konsultasi gratis dan pilih paket yang cocok.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-sky-800 shadow-lg hover:bg-sky-50"
              >
                <Phone className="h-4 w-4" />
                WhatsApp Kami
              </a>
              <a
                href="mailto:info@sportemu.com"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3 text-sm font-medium text-white hover:bg-white/10"
              >
                info@sportemu.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-700">
                <Waves className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-sm font-bold text-sky-900">Sportemu</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#kenapa" className="text-xs text-slate-500 hover:text-sky-700">Kenapa Sportemu</a>
              <a href="#paket" className="text-xs text-slate-500 hover:text-sky-700">Paket</a>
              <a href="#kontak" className="text-xs text-slate-500 hover:text-sky-700">Kontak</a>
              <Link href="/login" className="text-xs text-slate-500 hover:text-sky-700">Login Pelatih</Link>
            </div>
            <p className="text-xs text-slate-400">© 2024 Sportemu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
