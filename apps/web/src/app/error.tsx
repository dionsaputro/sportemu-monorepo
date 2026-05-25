'use client'

import { AlertCircle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <h1 className="mt-4 text-xl font-bold text-sky-900">Terjadi Kesalahan</h1>
      <p className="mt-2 max-w-md text-center text-sm text-slate-500">
        {error.message || 'Sesuatu tidak berjalan dengan baik. Coba lagi.'}
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800"
      >
        Coba Lagi
      </button>
    </div>
  )
}
