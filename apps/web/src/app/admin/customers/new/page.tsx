'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface City {
  id: string
  name: string
}

export default function NewCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cities, setCities] = useState<City[]>([])

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    city_id: '',
    notes: '',
  })

  useEffect(() => {
    async function loadCities() {
      const supabase = createClient()
      const { data } = await supabase.from('cities').select('id, name').eq('is_active', true).order('name')
      setCities(data || [])
    }
    loadCities()
  }, [])

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: insertError } = await supabase.from('customers').insert({
      full_name: form.full_name,
      phone: form.phone || null,
      email: form.email || null,
      address: form.address || null,
      city_id: form.city_id || null,
      notes: form.notes || null,
      created_by: user?.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/admin/customers')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/customers"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Tambah Customer</h1>
          <p className="mt-0.5 text-sm text-slate-500">Daftarkan customer baru</p>
        </div>
      </div>

      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Nama Lengkap *</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => updateForm('full_name', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              placeholder="Nama lengkap customer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">No. Telepon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateForm('phone', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateForm('email', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="email@contoh.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Alamat</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateForm('address', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              placeholder="Alamat lengkap"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Kota</label>
            <select
              value={form.city_id}
              onChange={(e) => updateForm('city_id', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            >
              <option value="">Pilih kota</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>{city.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Customer'}
            </button>
            <Link
              href="/admin/customers"
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
