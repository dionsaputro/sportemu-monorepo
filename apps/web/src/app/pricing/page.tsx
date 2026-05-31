import Link from 'next/link'
import { Waves, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function PricingPage() {
  const plans = [
    { name: 'Free', price: '0', period: '/selamanya', desc: 'Cocok buat yang baru mulai', clients: '5 klien', sessions: '20 sesi/bulan', popular: false, features: ['Booking link', 'Check-in foto', 'Invoice manual', 'Dashboard basic', '1 pelatih'] },
    { name: 'Pro', price: '199.000', period: '/bulan', desc: 'Untuk pelatih yang serius', clients: '50 klien', sessions: '500 sesi/bulan', popular: true, features: ['Semua fitur Free', 'Invoice otomatis', 'Laporan & insight', 'Priority support', 'Custom branding', '1 pelatih'] },
    { name: 'Enterprise', price: '499.000', period: '/bulan', desc: 'Untuk tim & studio', clients: 'Unlimited', sessions: 'Unlimited', popular: false, features: ['Semua fitur Pro', 'Multi-trainer (tim)', 'API access', 'Dedicated support', 'Custom integration', 'Unlimited pelatih'] },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-700">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="text-base font-bold text-sky-900">Sportemu</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-sky-700">Login</Link>
            <Link href="/signup" className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800">Daftar Gratis</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-bold text-sky-900 md:text-4xl">Harga yang simple & transparan</h1>
          <p className="mt-4 text-base text-slate-600">Mulai gratis, upgrade saat bisnis kamu berkembang. Tanpa hidden fees.</p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border p-8 ${plan.popular ? 'border-sky-200 ring-2 ring-sky-100' : 'border-slate-200'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-1 text-[11px] font-semibold text-white">Paling Populer</div>
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
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-sky-600" />{f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className={`mt-8 block rounded-xl py-3 text-center text-sm font-semibold ${plan.popular ? 'bg-sky-700 text-white hover:bg-sky-800' : 'border border-slate-200 text-slate-700 hover:bg-sky-50'}`}>
                {plan.price === '0' ? 'Mulai Gratis' : 'Pilih Plan'}
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-slate-500">Punya pertanyaan? <a href="mailto:support@sportemu.com" className="font-medium text-sky-700 hover:text-sky-800">Hubungi kami</a></p>
        </div>
      </div>
    </div>
  )
}
