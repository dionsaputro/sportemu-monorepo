import Link from 'next/link'
import { Waves } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <Waves className="h-12 w-12 text-sky-300" />
      <h1 className="mt-4 text-2xl font-bold text-sky-900">404</h1>
      <p className="mt-2 text-sm text-slate-500">Halaman yang kamu cari tidak ditemukan.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
