'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Waves, ArrowLeft } from 'lucide-react'

function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '', specialty: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { role: 'trainer', full_name: form.full_name },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Gagal membuat akun')
      setLoading(false)
      return
    }

    // Create trainer record
    const { error: trainerError } = await supabase.from('trainers').insert({
      id: data.user.id,
      specialty: form.specialty || null,
    })

    if (trainerError) {
      setError(trainerError.message)
      setLoading(false)
      return
    }

    router.push('/trainer')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-sky-900" />
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 800" preserveAspectRatio="none">
            <path d="M0,400 C200,300 400,500 800,400 L800,800 L0,800 Z" fill="white" />
            <path d="M0,500 C200,400 400,600 800,500 L800,800 L0,800 Z" fill="white" opacity="0.5" />
          </svg>
        </div>
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Sportemu</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Kelola bisnis<br />pelatihan kamu<br />lebih mudah.
            </h2>
            <p className="mt-4 max-w-sm text-base text-sky-100">
              Gratis untuk mulai. Upgrade kapan aja.
            </p>
            <div className="mt-8 space-y-3">
              <div className="flex items-center gap-3 text-sm text-sky-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Kelola klien & jadwal
              </div>
              <div className="flex items-center gap-3 text-sm text-sky-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Booking link untuk klien
              </div>
              <div className="flex items-center gap-3 text-sm text-sky-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Invoice & pembayaran
              </div>
              <div className="flex items-center gap-3 text-sm text-sky-100">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Check-in foto anti-fake
              </div>
            </div>
          </div>
          <p className="text-sm text-sky-200">Free: 5 klien, 20 sesi/bulan</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-sky-700">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Kembali</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-sky-900">Daftar Gratis</h1>
            <p className="mt-2 text-sm text-slate-500">
              Buat akun pelatih dan mulai kelola bisnis kamu.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Nama Lengkap</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => updateForm('full_name', e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="Nama kamu"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="email@contoh.com"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => updateForm('password', e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="Min. 6 karakter"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Bidang Olahraga</label>
              <input
                type="text"
                value={form.specialty}
                onChange={(e) => updateForm('specialty', e.target.value)}
                className="h-11 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="renang, gym, yoga..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-sky-700 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-sky-700 hover:text-sky-800">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}
