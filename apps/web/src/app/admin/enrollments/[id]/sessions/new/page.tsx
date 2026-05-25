'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewSessionPage() {
  const router = useRouter()
  const params = useParams()
  const enrollmentId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enrollment, setEnrollment] = useState<any>(null)
  const [availability, setAvailability] = useState<any[]>([])

  const [form, setForm] = useState({
    scheduled_date: '',
    start_time: '',
    end_time: '',
    notes: '',
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const { data: enr } = await supabase
        .from('enrollments')
        .select('*, customers(full_name), trainers!inner(profiles(full_name))')
        .eq('id', enrollmentId)
        .single()

      setEnrollment(enr)

      if (enr) {
        const { data: avail } = await supabase
          .from('trainer_availability')
          .select('*')
          .eq('trainer_id', enr.trainer_id)
          .eq('is_active', true)
          .order('day_of_week')

        setAvailability(avail || [])
      }
    }
    loadData()
  }, [enrollmentId])

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Auto-suggest time based on selected date + trainer availability
  useEffect(() => {
    if (!form.scheduled_date || availability.length === 0) return

    const dayOfWeek = new Date(form.scheduled_date).getDay()
    const slot = availability.find((a) => a.day_of_week === dayOfWeek)

    if (slot && !form.start_time) {
      setForm((prev) => ({
        ...prev,
        start_time: slot.start_time?.slice(0, 5) || '',
        end_time: slot.end_time ? slot.start_time?.slice(0, 5).replace(/(\d+):/, (_match: string, h: string) => `${String(parseInt(h) + 1).padStart(2, '0')}:`) : '',
      }))
    }
  }, [form.scheduled_date, availability])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    const { error: insertError } = await supabase.from('sessions').insert({
      enrollment_id: enrollmentId,
      trainer_id: enrollment.trainer_id,
      scheduled_date: form.scheduled_date,
      start_time: form.start_time,
      end_time: form.end_time,
      status: 'proposed',
      booking_source: 'customer_propose',
      notes: form.notes || null,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push(`/admin/enrollments/${enrollmentId}`)
    router.refresh()
  }

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/enrollments/${enrollmentId}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Propose Sesi</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {enrollment?.customers?.full_name} → {enrollment?.trainers?.profiles?.full_name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Form */}
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
            )}

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
                placeholder="Catatan untuk pelatih..."
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'Kirim Proposal'}
              </button>
              <Link
                href={`/admin/enrollments/${enrollmentId}`}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Batal
              </Link>
            </div>
          </form>
        </div>

        {/* Trainer Availability Hint */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal Pelatih</h3>
          {availability.length === 0 ? (
            <p className="text-xs text-slate-400">Pelatih belum set jadwal</p>
          ) : (
            <div className="space-y-2">
              {availability.map((slot: any) => (
                <div key={slot.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-xs font-medium text-slate-700">{dayNames[slot.day_of_week]}</span>
                  <span className="text-xs text-slate-500">{slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-[10px] text-slate-400">
            Pilih tanggal sesuai hari available pelatih. Waktu akan otomatis terisi.
          </p>
        </div>
      </div>
    </div>
  )
}
