import Link from 'next/link'
import { Waves, Calendar, Users, CheckCircle2, ArrowRight, Shield, Receipt, Share2, Camera, Smartphone, BarChart3, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100/50 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-700 shadow-sm">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-sky-900">Sportemu</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#fitur" className="text-sm text-slate-600 transition-colors hover:text-sky-700">Fitur</a>
            <a href="#cara-kerja" className="text-sm text-slate-600 transition-colors hover:text-sky-700">Cara Kerja</a>
            <a href="#harga" className="text-sm text-slate-600 transition-colors hover:text-sky-700">Harga</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-sky-700 sm:block">Login</Link>
            <Link href="/signup" className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800">
              Daftar Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-cyan-50/30" />
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-sky-100/50 blur-3xl" />
        <div className="absolute -bottom-20 left-0 h-[400px] w-[400px] rounded-full bg-cyan-100/30 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 lg:px-8 lg:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-4 py-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-sky-700">Gratis untuk mulai — upgrade kapan aja</span>
              </div>

              <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-sky-900 md:text-5xl xl:text-[56px]">
                Kelola bisnis<br />pelatihan kamu{' '}
                <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">dalam satu app</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
                Klien, jadwal, invoice, check-in — semua di satu tempat. Biar kamu fokus melatih, Sportemu yang urus administrasinya.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-sky-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200/50 transition-all hover:bg-sky-800 hover:shadow-xl"
                >
                  Mulai Gratis
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href="#cara-kerja" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50">
                  Lihat Demo
                </a>
              </div>

              <div className="mt-10 flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Tanpa kartu kredit</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Setup 2 menit</span>
              </div>
            </div>

            {/* App preview */}
            <div className="relative">
              <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-sky-100/50">
                <div className="rounded-xl bg-[#FAFBFC] p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-sky-700" />
                    <div className="h-3 w-20 rounded bg-slate-200" />
                    <div className="ml-auto h-3 w-12 rounded bg-slate-100" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['3 Sesi Hari Ini', '12 Klien', 'Rp 4.2jt'].map((t) => (
                      <div key={t} className="rounded-lg bg-white p-3 shadow-sm">
                        <p className="text-[9px] text-slate-400">stat</p>
                        <p className="mt-0.5 text-xs font-bold text-sky-900">{t}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-2">
                    {['09:00 — Rini (Renang)', '10:30 — Dedi (Gym)', '14:00 — Maya (Yoga)'].map((s) => (
                      <div key={s} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm">
                        <div className="h-2 w-2 rounded-full bg-sky-500" />
                        <span className="text-[10px] font-medium text-slate-700">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 -left-3 rounded-xl border bg-white px-4 py-3 shadow-xl">
                <p className="text-xs font-semibold text-emerald-700">✓ Check-in berhasil!</p>
                <p className="text-[10px] text-slate-500">Rini — 09:02</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-10">
        <div className="mx-auto max-w-6xl px-4 text-center lg:px-8">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Dipercaya pelatih olahraga di seluruh Indonesia</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-8">
            {['Renang', 'Gym', 'Yoga', 'Bulu Tangkis', 'Tennis', 'Martial Arts'].map((sport) => (
              <span key={sport} className="text-sm font-semibold text-slate-400">{sport}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Fitur</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">
              Semua yang kamu butuhkan untuk manage bisnis pelatihan
            </h2>
            <p className="mt-4 text-base text-slate-600">Dari booking sampai pembayaran, satu platform untuk semuanya.</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: 'Kelola Klien', desc: 'Database klien lengkap. Riwayat sesi, progress, dan kontak dalam satu tempat.' },
              { icon: Share2, title: 'Booking Link', desc: 'Share link ke klien. Mereka pilih jadwal sendiri, kamu tinggal approve. Kayak Calendly.' },
              { icon: Calendar, title: 'Jadwal & Availability', desc: 'Set slot available kamu. Klien cuma bisa booking di waktu yang kamu tentukan.' },
              { icon: Camera, title: 'Check-in Foto', desc: 'Bukti kehadiran dengan foto. Timestamp dari server, anti-manipulasi.' },
              { icon: Receipt, title: 'Invoice Otomatis', desc: 'Invoice dibuat otomatis. Prepaid atau postpaid, terserah kamu.' },
              { icon: BarChart3, title: 'Dashboard & Insight', desc: 'Lihat statistik bisnis kamu. Sesi selesai, revenue, klien aktif — semua real-time.' },
              { icon: Smartphone, title: 'Mobile Friendly', desc: 'Akses dari HP. Check-in langsung dari kamera. Responsive di semua device.' },
              { icon: Shield, title: 'Data Aman', desc: 'Enkripsi end-to-end. Data klien kamu aman. Role-based access control.' },
              { icon: Zap, title: 'Setup Cepat', desc: 'Daftar, tambah klien, mulai. Ga perlu training. Ga perlu IT support.' },
            ].map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="group rounded-2xl border border-slate-100 p-6 transition-all hover:border-sky-100 hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 transition-colors group-hover:bg-sky-100">
                    <Icon className="h-5 w-5 text-sky-700" />
                  </div>
                  <h3 className="mt-4 text-sm font-semibold text-sky-900">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="cara-kerja" className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Cara Kerja</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">Mulai dalam 3 langkah</h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Daftar & Setup', desc: 'Buat akun gratis. Tambahkan klien dan set paket harga kamu. 2 menit selesai.' },
              { step: '02', title: 'Share Link ke Klien', desc: 'Kirim booking link via WhatsApp. Klien pilih jadwal sendiri, kamu approve.' },
              { step: '03', title: 'Latih & Check-in', desc: 'Datang, foto check-in, latihan, check-out. Invoice otomatis. Done.' },
            ].map((item) => (
              <div key={item.step} className="rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-sm font-bold text-white shadow-lg">
                  {item.step}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-sky-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="harga" className="py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Harga</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">Simple, transparan</h2>
            <p className="mt-4 text-base text-slate-600">Mulai gratis. Upgrade saat bisnis kamu berkembang.</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Free', price: '0', period: '/selamanya', desc: 'Cocok buat yang baru mulai', clients: '5 klien', sessions: '20 sesi/bulan', popular: false, features: ['Booking link', 'Check-in foto', 'Invoice manual', 'Dashboard basic'] },
              { name: 'Pro', price: '199.000', period: '/bulan', desc: 'Untuk pelatih yang serius', clients: '50 klien', sessions: '500 sesi/bulan', popular: true, features: ['Semua fitur Free', 'Invoice otomatis', 'Laporan & insight', 'Priority support', 'Custom branding'] },
              { name: 'Enterprise', price: '499.000', period: '/bulan', desc: 'Untuk tim & studio', clients: 'Unlimited', sessions: 'Unlimited', popular: false, features: ['Semua fitur Pro', 'Multi-trainer', 'API access', 'Dedicated support', 'Custom integration'] },
            ].map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl border p-8 transition-all hover:shadow-lg ${plan.popular ? 'border-sky-200 bg-white ring-2 ring-sky-100' : 'border-slate-200 bg-white'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-1 text-[11px] font-semibold text-white">
                    Paling Populer
                  </div>
                )}
                <h3 className="text-lg font-bold text-sky-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{plan.desc}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-sm text-slate-500">Rp</span>
                  <span className="text-4xl font-bold text-sky-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <div className="mt-4 flex gap-3 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{plan.clients}</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">{plan.sessions}</span>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-sky-600" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${plan.popular ? 'bg-sky-700 text-white shadow-sm hover:bg-sky-800' : 'border border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-sky-50'}`}>
                  {plan.price === '0' ? 'Mulai Gratis' : 'Pilih Plan'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Testimoni</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">Dipercaya pelatih di seluruh Indonesia</h2>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Coach Budi', role: 'Pelatih Renang, Jakarta', text: 'Sebelum Sportemu, jadwal gue berantakan di WhatsApp. Sekarang klien booking sendiri, gue tinggal approve. Revenue naik 40%.' },
              { name: 'Sari Dewi', role: 'Instruktur Yoga, Bandung', text: 'Invoice otomatis itu game changer. Dulu sering lupa nagih, sekarang semua tercatat rapi. Plus check-in foto bikin klien lebih disiplin.' },
              { name: 'Andi Pratama', role: 'Personal Trainer, Tangerang', text: 'Free plan-nya udah cukup buat gue yang baru mulai. Sekarang udah upgrade ke Pro karena klien nambah terus. Worth it.' },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-xs font-bold text-white">
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-sky-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-sky-900 p-12 md:p-20">
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-sky-600/30 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="relative mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-white md:text-4xl">Siap digitalisasi bisnis pelatihan kamu?</h2>
              <p className="mx-auto mt-4 max-w-md text-base text-sky-100">Daftar gratis sekarang. Tanpa kartu kredit, tanpa kontrak.</p>
              <Link href="/signup" className="group mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-sky-800 shadow-xl hover:bg-sky-50">
                Daftar Gratis Sekarang
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-16">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-700">
                  <Waves className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-bold text-sky-900">Sportemu</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                Platform manajemen bisnis untuk pelatih olahraga independen. Kelola klien, jadwal, dan pembayaran dalam satu tempat.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Produk</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#fitur" className="text-sm text-slate-600 hover:text-sky-700">Fitur</a></li>
                <li><a href="#harga" className="text-sm text-slate-600 hover:text-sky-700">Harga</a></li>
                <li><Link href="/signup" className="text-sm text-slate-600 hover:text-sky-700">Daftar</Link></li>
                <li><Link href="/login" className="text-sm text-slate-600 hover:text-sky-700">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Support</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="mailto:support@sportemu.com" className="text-sm text-slate-600 hover:text-sky-700">Email</a></li>
                <li><a href="https://wa.me/6281234567890" className="text-sm text-slate-600 hover:text-sky-700">WhatsApp</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-100 pt-8 text-center">
            <p className="text-xs text-slate-400">© 2024 Sportemu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
