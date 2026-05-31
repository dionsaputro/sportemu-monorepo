'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Enrollment {
  id: string
  customer_name: string
  package_name: string
  sessions_done: number
  sessions_total: number
}

export default function TrainerNewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [limitWarning, setLimitWarning] = useState('')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])

  const [form, setForm] = useState({
    enrollment_id: '',
    scheduled_date: '',
    start_time: '',
    end_time: '',
    notes: '',
  })

  useEffect(() => {
    async function loadEnrollments() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      // Check session limit
      const { data: sub } = await supabase
        .from('trainer_subscriptions')
        .select('subscription_plans(max_sessions_per_month, name)')
        .eq('trainer_id', user!.id)
        .in('status', ['free', 'active'])
        .single()

      const maxSessions = (sub?.subscription_plans as any)?.max_sessions_per_month ?? 20
      if (maxSessions !== -1) {
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        const { count } = await supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('trainer_id', user!.id).gte('scheduled_date', monthStart).lte('scheduled_date', monthEnd)
        const remaining = maxSessions - (count || 0)
        if (remaining <= 3 && remaining > 0) {
          setLimitWarning(`Sisa ${remaining} sesi bulan ini (plan ${(sub?.subscription_plans as any)?.name})`)
        } else if (remaining <= 0) {
          setError(`Limit sesi bulan ini tercapai (${maxSessions} sesi). Upgrade plan untuk menambah.`)
        }
      }

      const { data } = await supabase
        .from('enrollments')
        .select('id, sessions_done, sessions_total, customers(full_name), packages(name)')
        .eq('trainer_id', user!.id)
        .eq('status', 'active')

      setEnrollments(
        (data || []).map((e: any) => ({
          id: e.id,
          customer_name: e.customers?.full_name || '—',
          package_name: e.packages?.name || '—',
          sessions_done: e.sessions_done,
          sessions_total: e.sessions_total,
        }))
      )
    }
    loadEnrollments()
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

    const { error: insertError } = await supabase.from('sessions').insert({
      enrollment_id: form.enrollment_id,
      trainer_id: user!.id,
      scheduled_date: form.scheduled_date,
      start_time: form.start_time,
      end_time: form.end_time,
      status: 'approved', // Trainer-created sessions are auto-approved
      booking_source: 'trainer_slot',
      notes: form.notes || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/trainer/sessions')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/trainer/sessions"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Tambah Sesi</h1>
          <p className="mt-0.5 text-sm text-slate-500">Jadwalkan sesi untuk klien kamu</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
          )}
          {limitWarning && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">{limitWarning}</div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Klien *</label>
            <select
              required
              value={form.enrollment_id}
              onChange={(e) => updateForm('enrollment_id', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            >
              <option value="">Pilih klien</option>
              {enrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.customer_name} — {e.package_name} ({e.sessions_done}/{e.sessions_total} sesi)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Tanggal *</label>
            <input
              type="date"
              required
              value={form.scheduled_date}
              onChange={(e) => updateForm('scheduled_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Jam Mulai *</label>
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) => updateForm('start_time', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Jam Selesai *</label>
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) => updateForm('end_time', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              rows={2}
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
              {loading ? 'Menyimpan...' : 'Jadwalkan Sesi'}
            </button>
            <Link
              href="/trainer/sessions"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-sky-100 bg-sky-50/50 p-4">
        <p className="text-xs text-sky-700">
          💡 Sesi yang kamu buat langsung berstatus <strong>Approved</strong> — tidak perlu menunggu persetujuan.
        </p>
      </div>
    </div>
  )
}
