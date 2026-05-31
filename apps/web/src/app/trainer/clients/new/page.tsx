'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function TrainerNewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitReached, setLimitReached] = useState(false)
  const [limitInfo, setLimitInfo] = useState('')
  const [cities, setCities] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', city_id: '', notes: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Check limits
      const { data: sub } = await supabase
        .from('trainer_subscriptions')
        .select('subscription_plans(max_clients, name)')
        .eq('trainer_id', user!.id)
        .in('status', ['free', 'active'])
        .single()

      const maxClients = (sub?.subscription_plans as any)?.max_clients ?? 5
      const planName = (sub?.subscription_plans as any)?.name ?? 'Free'

      if (maxClients !== -1) {
        const { count } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('created_by', user!.id)

        if ((count || 0) >= maxClients) {
          setLimitReached(true)
          setLimitInfo(`Plan ${planName} kamu hanya bisa ${maxClients} klien. Upgrade untuk menambah lebih banyak.`)
        }
      }

      const { data } = await supabase.from('cities').select('id, name').eq('is_active', true).order('name')
      setCities(data || [])
    }
    load()
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
      city_id: form.city_id || null,
      notes: form.notes || null,
      created_by: user?.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/trainer/clients')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trainer/clients" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Tambah Klien</h1>
          <p className="mt-0.5 text-sm text-slate-500">Daftarkan klien baru</p>
        </div>
      </div>

      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        {limitReached ? (
          <div className="flex flex-col items-center py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-amber-500" />
            <p className="mt-3 text-sm font-medium text-sky-900">Limit klien tercapai</p>
            <p className="mt-1 text-xs text-slate-500">{limitInfo}</p>
            <Link href="/trainer/settings" className="mt-4 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800">
              Lihat Upgrade Options
            </Link>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Nama Lengkap *</label>
            <input type="text" required value={form.full_name} onChange={(e) => updateForm('full_name', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20" placeholder="Nama klien" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Telepon</label>
              <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20" placeholder="08xxx" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Email</label>
              <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20" placeholder="email@contoh.com" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Kota</label>
            <select value={form.city_id} onChange={(e) => updateForm('city_id', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20">
              <option value="">Pilih kota</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Catatan</label>
            <textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20" placeholder="Catatan..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan'}
            </button>
            <Link href="/trainer/clients" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</Link>
          </div>
        </form>
        )}
      </div>
    </div>
  )
}
