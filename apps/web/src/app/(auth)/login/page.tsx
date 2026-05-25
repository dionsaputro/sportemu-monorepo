'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const role = data.user.user_metadata?.role || 'trainer'
    const destination = redirect || (role === 'admin' ? '/admin' : '/trainer')
    router.push(destination)
    router.refresh()
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600 via-sky-700 to-sky-900" />
        {/* Wave pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="h-full w-full" viewBox="0 0 800 800" preserveAspectRatio="none">
            <path d="M0,400 C200,300 400,500 800,400 L800,800 L0,800 Z" fill="white" />
            <path d="M0,500 C200,400 400,600 800,500 L800,800 L0,800 Z" fill="white" opacity="0.5" />
            <path d="M0,600 C200,500 400,700 800,600 L800,800 L0,800 Z" fill="white" opacity="0.3" />
          </svg>
        </div>
        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-xl backdrop-blur-sm">
              🏊
            </div>
            <span className="text-xl font-bold text-white">Sportemu</span>
          </div>
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white">
              Kelola pelatihan<br />renang jadi lebih<br />mudah.
            </h2>
            <p className="mt-4 max-w-sm text-base text-sky-100">
              Jadwal, check-in, pembayaran — semua dalam satu platform yang simpel.
            </p>
          </div>
          <p className="text-sm text-sky-200">
            © 2024 Sportemu. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex w-full items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700 text-xl text-white">
                🏊
              </div>
              <span className="text-xl font-bold">Sportemu</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Masuk ke akun
            </h1>
            <p className="mt-2 text-[15px] text-muted-foreground">
              Masukkan email dan password untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[13px] font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-[14px] outline-none transition-all placeholder:text-muted-foreground/60 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-[13px] font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete="current-password"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-[14px] outline-none transition-all placeholder:text-muted-foreground/60 focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-lg bg-sky-700 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-sky-800 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:hover:shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Masuk...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-[13px] text-muted-foreground">
            Belum punya akun? Hubungi admin untuk didaftarkan.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
