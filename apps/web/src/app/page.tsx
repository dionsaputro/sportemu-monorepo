'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Waves, Calendar, MapPin, Star, Users, CheckCircle2, ArrowRight, Clock, Phone, Shield, Camera, Award } from 'lucide-react'

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {isInView ? target : 0}{suffix}
      </motion.span>
    </motion.span>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-slate-100/50 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-700 shadow-sm">
              <Waves className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="text-base font-bold text-sky-900">Sportemu</span>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#kenapa" className="text-sm text-slate-600 transition-colors hover:text-sky-700">Kenapa Kami</a>
            <a href="#pelatih" className="text-sm text-slate-600 transition-colors hover:text-sky-700">Pelatih</a>
            <a href="#paket" className="text-sm text-slate-600 transition-colors hover:text-sky-700">Paket</a>
            <a href="#testimoni" className="text-sm text-slate-600 transition-colors hover:text-sky-700">Testimoni</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-medium text-slate-600 hover:text-sky-700 sm:block">
              Login Pelatih
            </Link>
            <a href="#kontak" className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-800 hover:shadow-md">
              Daftar Les
            </a>
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
            {/* Left content */}
            <div>
              <FadeIn>
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-4 py-1.5 backdrop-blur-sm">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  <span className="text-xs font-medium text-sky-700">Pendaftaran dibuka untuk Jabodetabek</span>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 className="text-4xl font-bold leading-[1.15] tracking-tight text-sky-900 md:text-5xl xl:text-[56px]">
                  Belajar renang<br />
                  dengan pelatih{' '}
                  <span className="relative">
                    <span className="bg-gradient-to-r from-sky-600 to-cyan-500 bg-clip-text text-transparent">terbaik</span>
                    <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 200 8" fill="none">
                      <path d="M2 6C50 2 150 2 198 6" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" />
                      <defs><linearGradient id="grad"><stop stopColor="#0284c7" /><stop offset="1" stopColor="#06b6d4" /></linearGradient></defs>
                    </svg>
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
                  Les renang privat untuk anak dan dewasa. Pelatih bersertifikat, jadwal fleksibel, lokasi kolam terdekat dari kamu.
                </p>
              </FadeIn>

              <FadeIn delay={0.3}>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a
                    href="#paket"
                    className="group inline-flex items-center gap-2 rounded-xl bg-sky-700 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-sky-200/50 transition-all hover:bg-sky-800 hover:shadow-xl hover:shadow-sky-200/60"
                  >
                    Lihat Paket Les
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 text-sm font-medium text-slate-700 transition-all hover:border-sky-200 hover:bg-sky-50"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp
                  </a>
                </div>
              </FadeIn>

              <FadeIn delay={0.4}>
                <div className="mt-10 flex items-center gap-6">
                  <div className="flex -space-x-2">
                    {['bg-sky-600', 'bg-cyan-500', 'bg-teal-500', 'bg-sky-400'].map((bg, i) => (
                      <div key={i} className={`h-9 w-9 rounded-full ${bg} border-2 border-white`} />
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                      <span className="ml-1 text-sm font-semibold text-slate-700">4.9</span>
                    </div>
                    <p className="text-xs text-slate-500">500+ murid puas</p>
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Right image */}
            <FadeIn delay={0.2} className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-2xl shadow-sky-200/40">
                <img
                  src="https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop"
                  alt="Pelatih renang mengajar murid di kolam"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-sky-900/20 to-transparent" />
              </div>
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="absolute -bottom-4 -left-4 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Sesi Selesai!</p>
                    <p className="text-[10px] text-slate-500">Rini baru saja check-out</p>
                  </div>
                </div>
              </motion.div>
              {/* Floating stats */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="absolute -right-4 top-8 rounded-2xl border border-white/50 bg-white/90 p-4 shadow-xl backdrop-blur-md"
              >
                <p className="text-2xl font-bold text-sky-700">156</p>
                <p className="text-[10px] text-slate-500">Sesi bulan ini</p>
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 md:grid-cols-4 lg:px-8">
          {[
            { value: 12, suffix: '+', label: 'Pelatih Aktif' },
            { value: 500, suffix: '+', label: 'Murid Terdaftar' },
            { value: 3000, suffix: '+', label: 'Sesi Selesai' },
            { value: 4.9, suffix: '/5', label: 'Rating Rata-rata' },
          ].map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.1} className="text-center">
              <p className="text-3xl font-bold text-sky-900">
                <Counter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Kenapa Sportemu */}
      <section id="kenapa" className="py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Kenapa Sportemu</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">
              Bukan les renang biasa
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Kami menggabungkan pelatih berkualitas dengan teknologi modern untuk pengalaman belajar yang lebih baik.
            </p>
          </FadeIn>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Award, title: 'Pelatih Bersertifikat', desc: 'Semua pelatih kami punya sertifikasi resmi dan pengalaman minimal 3 tahun mengajar renang.', img: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=250&fit=crop' },
              { icon: Calendar, title: 'Booking Online', desc: 'Pilih jadwal lewat link. Ga perlu chat bolak-balik. Tinggal klik, pelatih langsung konfirmasi.', img: 'https://images.unsplash.com/photo-1434596922112-19cb4f9e2c41?w=400&h=250&fit=crop' },
              { icon: MapPin, title: 'Kolam Terdekat', desc: 'Pelatih datang ke kolam renang dekat rumah kamu. Coverage area Jabodetabek.', img: 'https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?w=400&h=250&fit=crop' },
              { icon: Users, title: 'Privat 1-on-1', desc: 'Fokus penuh ke kamu atau anak kamu. Progress lebih cepat dibanding kelas grup.', img: 'https://images.unsplash.com/photo-1560090995-01632a28895b?w=400&h=250&fit=crop' },
              { icon: Camera, title: 'Bukti Check-in', desc: 'Setiap sesi ada bukti foto kehadiran. Kamu bisa pantau dari mana aja.', img: 'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&h=250&fit=crop' },
              { icon: Shield, title: 'Aman & Terpercaya', desc: 'Semua pelatih terverifikasi. Pembayaran transparan. Garansi kepuasan.', img: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=250&fit=crop' },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <FadeIn key={feature.title} delay={i * 0.1}>
                  <div className="group overflow-hidden rounded-2xl border border-slate-100 transition-all hover:border-sky-100 hover:shadow-lg hover:shadow-sky-50">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={feature.img}
                        alt={feature.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    </div>
                    <div className="p-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50">
                        <Icon className="h-5 w-5 text-sky-700" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-sky-900">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Cara Kerja</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">
              3 langkah mulai les renang
            </h2>
          </FadeIn>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Pilih Paket', desc: 'Tentukan paket yang sesuai kebutuhan dan budget kamu. Mulai dari 4 sesi per bulan.', color: 'from-sky-500 to-sky-600' },
              { step: '02', title: 'Booking Jadwal', desc: 'Pilih hari dan jam yang cocok lewat link booking. Pelatih langsung konfirmasi.', color: 'from-cyan-500 to-cyan-600' },
              { step: '03', title: 'Mulai Latihan', desc: 'Datang ke kolam, pelatih sudah siap. Check-in foto, latihan, selesai!', color: 'from-teal-500 to-teal-600' },
            ].map((item, i) => (
              <FadeIn key={item.step} delay={i * 0.15}>
                <div className="relative rounded-2xl bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-sm font-bold text-white shadow-lg`}>
                    {item.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-sky-900">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  {i < 2 && (
                    <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-slate-200 md:block" />
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Pelatih */}
      <section id="pelatih" className="py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Tim Kami</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">
              Pelatih profesional & berpengalaman
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Setiap pelatih dipilih ketat dan punya track record mengajar yang terbukti.
            </p>
          </FadeIn>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Budi Santoso', specialty: 'Renang Dewasa', exp: '5 tahun', area: 'Jakarta Selatan', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face', desc: 'Spesialis freestyle & butterfly. Sabar dan detail dalam mengajar teknik.' },
              { name: 'Sari Dewi', specialty: 'Yoga & Aqua Fitness', exp: '4 tahun', area: 'Jakarta Pusat', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face', desc: 'Kombinasi yoga dan renang untuk kebugaran menyeluruh.' },
              { name: 'Andi Pratama', specialty: 'Renang Anak', exp: '6 tahun', area: 'Tangerang', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face', desc: 'Ahli mengajar anak usia 4-12 tahun. Pendekatan fun dan aman.' },
            ].map((trainer, i) => (
              <FadeIn key={trainer.name} delay={i * 0.1}>
                <div className="group rounded-2xl border border-slate-100 p-6 transition-all hover:border-sky-100 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <img
                      src={trainer.img}
                      alt={trainer.name}
                      className="h-16 w-16 rounded-2xl object-cover shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-sky-900">{trainer.name}</p>
                      <p className="text-xs text-sky-600">{trainer.specialty}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">{trainer.desc}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
                      {trainer.exp} pengalaman
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
                      📍 {trainer.area}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Paket */}
      <section id="paket" className="bg-gradient-to-b from-slate-50 to-white py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Paket Les</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">
              Pilih paket yang cocok
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Semua paket termasuk pelatih bersertifikat, booking online, dan bukti check-in foto.
            </p>
          </FadeIn>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { name: 'Starter', sessions: 4, price: '800.000', period: '/bulan', desc: 'Cocok buat yang mau coba dulu. 1x seminggu.', popular: false },
              { name: 'Reguler', sessions: 8, price: '1.400.000', period: '/bulan', desc: 'Paling populer. 2x seminggu, progress optimal.', popular: true },
              { name: 'Intensif', sessions: 12, price: '1.800.000', period: '/bulan', desc: 'Buat yang serius. 3x seminggu, hemat 25%.', popular: false },
            ].map((pkg, i) => (
              <FadeIn key={pkg.name} delay={i * 0.1}>
                <div className={`relative rounded-2xl border p-8 transition-all hover:shadow-lg ${
                  pkg.popular
                    ? 'border-sky-200 bg-white ring-2 ring-sky-100 hover:shadow-sky-100'
                    : 'border-slate-200 bg-white hover:border-sky-100'
                }`}>
                  {pkg.popular && (
                    <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-1 text-[11px] font-semibold text-white shadow-sm">
                      Paling Populer
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-sky-900">{pkg.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{pkg.desc}</p>
                  <div className="mt-5 flex items-baseline gap-1">
                    <span className="text-sm text-slate-500">Rp</span>
                    <span className="text-4xl font-bold text-sky-900">{pkg.price}</span>
                    <span className="text-sm text-slate-500">{pkg.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3">
                    {[
                      `${pkg.sessions} sesi privat 1-on-1`,
                      'Pelatih bersertifikat',
                      'Jadwal fleksibel',
                      'Booking via link',
                      'Bukti check-in foto',
                      pkg.sessions >= 8 ? 'Laporan progress' : null,
                      pkg.sessions >= 12 ? 'Konsultasi teknik gratis' : null,
                    ].filter(Boolean).map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-sky-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#kontak"
                    className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold transition-all ${
                      pkg.popular
                        ? 'bg-sky-700 text-white shadow-sm hover:bg-sky-800 hover:shadow-md'
                        : 'border border-slate-200 text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
                    }`}
                  >
                    Daftar Sekarang
                  </a>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimoni" className="py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">Testimoni</span>
            <h2 className="mt-3 text-3xl font-bold text-sky-900 md:text-4xl">
              Kata murid kami
            </h2>
          </FadeIn>

          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { name: 'Rini Wulandari', role: 'Ibu dari Aqila (7 tahun)', text: 'Anak saya awalnya takut air banget. Setelah 2 bulan les sama Coach Budi, sekarang udah bisa renang sendiri. Sabar banget ngajarnya!', rating: 5 },
              { name: 'Dedi Kurniawan', role: 'Karyawan, 32 tahun', text: 'Booking jadwal gampang banget lewat link. Pelatihnya selalu on time. Dalam 1 bulan udah bisa freestyle basic.', rating: 5 },
              { name: 'Maya Sari', role: 'Freelancer, 28 tahun', text: 'Saya belajar renang di usia 28. Ga pernah nyangka bisa secepat ini. Pelatihnya supportive dan ga judgmental.', rating: 5 },
              { name: 'Agus Setiawan', role: 'Ayah dari Raka (5 tahun)', text: 'Coach Andi jago banget handle anak kecil. Raka yang tadinya nangis di kolam, sekarang minta les terus.', rating: 5 },
              { name: 'Lina Hartono', role: 'Ibu rumah tangga, 35 tahun', text: 'Yoga + renang combo-nya Sari itu perfect buat saya. Badan lebih fit, tidur lebih nyenyak.', rating: 5 },
              { name: 'Bram Wijaya', role: 'Mahasiswa, 21 tahun', text: 'Harga reasonable, pelatih pro. Dalam 3 bulan udah bisa 4 gaya. Worth it banget.', rating: 5 },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.08}>
                <div className="rounded-2xl border border-slate-100 p-6 transition-all hover:border-sky-100 hover:shadow-md">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">&ldquo;{t.text}&rdquo;</p>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-sm font-semibold text-sky-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="kontak" className="py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-700 via-sky-800 to-sky-900 p-12 md:p-20">
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-sky-600/30 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />
              <div className="relative mx-auto max-w-2xl text-center">
                <h2 className="text-3xl font-bold text-white md:text-4xl">
                  Siap mulai belajar renang?
                </h2>
                <p className="mx-auto mt-4 max-w-md text-base text-sky-100">
                  Hubungi kami sekarang untuk konsultasi gratis. Tim kami siap bantu pilihkan pelatih dan paket yang cocok.
                </p>
                <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-sky-800 shadow-xl transition-all hover:bg-sky-50 hover:shadow-2xl"
                  >
                    <Phone className="h-4 w-4" />
                    WhatsApp Kami
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </a>
                  <a
                    href="mailto:info@sportemu.com"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-white/10"
                  >
                    info@sportemu.com
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
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
                Platform les renang dan olahraga privat terpercaya di Jabodetabek. Pelatih bersertifikat, jadwal fleksibel.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Menu</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#kenapa" className="text-sm text-slate-600 hover:text-sky-700">Kenapa Kami</a></li>
                <li><a href="#pelatih" className="text-sm text-slate-600 hover:text-sky-700">Pelatih</a></li>
                <li><a href="#paket" className="text-sm text-slate-600 hover:text-sky-700">Paket</a></li>
                <li><a href="#kontak" className="text-sm text-slate-600 hover:text-sky-700">Kontak</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kontak</h4>
              <ul className="mt-4 space-y-2.5">
                <li><a href="https://wa.me/6281234567890" className="text-sm text-slate-600 hover:text-sky-700">WhatsApp</a></li>
                <li><a href="mailto:info@sportemu.com" className="text-sm text-slate-600 hover:text-sky-700">info@sportemu.com</a></li>
                <li><Link href="/login" className="text-sm text-slate-600 hover:text-sky-700">Login Pelatih</Link></li>
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
