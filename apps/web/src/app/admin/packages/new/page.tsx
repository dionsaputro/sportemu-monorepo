'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewPackagePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    name: '',
    session_count: '',
    duration_days: '30',
    price: '',
    description: '',
  })

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { error: insertError } = await supabase.from('packages').insert({
      name: form.name,
      session_count: parseInt(form.session_count),
      duration_days: parseInt(form.duration_days),
      price: parseFloat(form.price),
      description: form.description || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/packages')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/packages"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Tambah Paket</h1>
          <p className="mt-0.5 text-sm text-slate-500">Buat paket latihan baru</p>
        </div>
      </div>

      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Nama Paket *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              placeholder="Paket 4x / Bulan"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Jumlah Sesi *</label>
              <input
                type="number"
                required
                min="1"
                value={form.session_count}
                onChange={(e) => updateForm('session_count', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="4"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Durasi (hari) *</label>
              <input
                type="number"
                required
                min="1"
                value={form.duration_days}
                onChange={(e) => updateForm('duration_days', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="30"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Harga (Rp) *</label>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => updateForm('price', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="800000"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Deskripsi</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              placeholder="Deskripsi singkat paket..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Paket'}
            </button>
            <Link
              href="/admin/packages"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
