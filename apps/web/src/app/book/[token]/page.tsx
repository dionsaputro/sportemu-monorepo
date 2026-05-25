'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, CheckCircle2, Waves } from 'lucide-react'

interface AvailabilitySlot {
  day_of_week: number
  start_time: string
  end_time: string
}

interface Session {
  id: string
  scheduled_date: string
  start_time: string
  end_time: string
  status: string
}

export default function BookingPage() {
  const params = useParams()
  const token = params.token as string

  const [enrollment, setEnrollment] = useState<any>(null)
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState({ start: '', end: '' })

  useEffect(() => {
    loadData()
  }, [token])

  async function loadData() {
    const supabase = createClient()

    // Get enrollment by token
    const { data: enr } = await supabase
      .from('enrollments')
      .select('*, customers(full_name), trainers!inner(profiles(full_name), specialty), packages(name, session_count)')
      .eq('booking_token', token)
      .single()

    if (!enr) {
      setError('Link tidak valid atau enrollment sudah selesai')
      setLoading(false)
      return
    }

    setEnrollment(enr)

    // Get trainer availability
    const { data: avail } = await supabase
      .from('trainer_availability')
      .select('day_of_week, start_time, end_time')
      .eq('trainer_id', enr.trainer_id)
      .eq('is_active', true)

    setAvailability(avail || [])

    // Get existing sessions for this enrollment
    const { data: sess } = await supabase
      .from('sessions')
      .select('id, scheduled_date, start_time, end_time, status')
      .eq('enrollment_id', enr.id)
      .in('status', ['proposed', 'approved', 'completed'])
      .order('scheduled_date')

    setSessions(sess || [])
    setLoading(false)
  }

  async function handleBook() {
    if (!selectedDate || !selectedTime.start || !selectedTime.end) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()

    const { error: insertError } = await supabase.from('sessions').insert({
      enrollment_id: enrollment.id,
      trainer_id: enrollment.trainer_id,
      scheduled_date: selectedDate,
      start_time: selectedTime.start,
      end_time: selectedTime.end,
      status: 'proposed',
      booking_source: 'customer_propose',
    })

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setSuccess('Jadwal berhasil diajukan! Menunggu konfirmasi pelatih.')
    setSelectedDate(null)
    setSelectedTime({ start: '', end: '' })
    setSubmitting(false)
    loadData() // Refresh sessions
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    )
  }

  if (error && !enrollment) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <Waves className="mx-auto h-12 w-12 text-slate-300" />
          <p className="mt-4 text-sm font-medium text-slate-600">{error}</p>
        </div>
      </div>
    )
  }

  // Calendar helpers
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const availableDays = new Set(availability.map((a) => a.day_of_week))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Sessions on selected date
  const sessionsOnDate = sessions.filter((s) => s.scheduled_date === selectedDate)

  // Get available time slot for selected date
  const selectedDayOfWeek = selectedDate ? new Date(selectedDate).getDay() : -1
  const daySlots = availability.filter((a) => a.day_of_week === selectedDayOfWeek)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-700">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-sky-900">Sportemu</h1>
              <p className="text-xs text-slate-500">Booking Jadwal Latihan</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Enrollment info */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Halo, <strong className="text-sky-900">{enrollment.customers?.full_name}</strong></p>
          <p className="mt-1 text-xs text-slate-400">
            Pelatih: {enrollment.trainers?.profiles?.full_name} • {enrollment.packages?.name} • {enrollment.sessions_done}/{enrollment.sessions_total} sesi
          </p>
        </div>

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        )}

        {error && enrollment && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        {/* My sessions */}
        {sessions.length > 0 && (
          <div className="mb-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Jadwal Kamu</h3>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`rounded-lg border-l-4 border border-slate-100 px-4 py-3 ${
                    s.status === 'approved' ? 'border-l-sky-500 bg-sky-50/50' :
                    s.status === 'proposed' ? 'border-l-amber-400 bg-amber-50/50' :
                    'border-l-emerald-500 bg-emerald-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-sky-900">
                        {new Date(s.scheduled_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p className="text-xs text-slate-500">{s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      s.status === 'approved' ? 'bg-sky-100 text-sky-700' :
                      s.status === 'proposed' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {s.status === 'approved' ? 'Dikonfirmasi' : s.status === 'proposed' ? 'Menunggu' : 'Selesai'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendar */}
        {enrollment.status === 'active' && enrollment.sessions_done < enrollment.sessions_total && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-medium text-sky-900">
                <Calendar className="h-4 w-4" />
                Pilih Tanggal
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentMonth(new Date(year, month - 1))}
                  className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  ←
                </button>
                <span className="px-2 py-1 text-xs font-medium text-slate-700">
                  {monthNames[month]} {year}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(year, month + 1))}
                  className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  →
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {dayNames.map((d) => (
                <div key={d} className="py-2 text-center text-[10px] font-medium text-slate-400">{d}</div>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(year, month, day)
                const dateStr = date.toISOString().split('T')[0]
                const dayOfWeek = date.getDay()
                const isAvailable = availableDays.has(dayOfWeek) && date >= today
                const isSelected = dateStr === selectedDate
                const hasMySession = sessions.some((s) => s.scheduled_date === dateStr)

                return (
                  <button
                    key={day}
                    disabled={!isAvailable}
                    onClick={() => {
                      setSelectedDate(dateStr)
                      // Auto-fill time from availability
                      const slot = availability.find((a) => a.day_of_week === dayOfWeek)
                      if (slot) {
                        setSelectedTime({ start: slot.start_time.slice(0, 5), end: slot.end_time.slice(0, 5) })
                      }
                    }}
                    className={`relative flex h-10 items-center justify-center rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-sky-700 text-white shadow-sm'
                        : hasMySession
                        ? 'bg-sky-100 text-sky-800 ring-2 ring-sky-300'
                        : isAvailable
                        ? 'text-slate-700 hover:bg-sky-50'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    {day}
                    {hasMySession && !isSelected && (
                      <span className="absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-sky-600" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Time selection */}
            {selectedDate && (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <h4 className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-700">
                  <Clock className="h-3.5 w-3.5" />
                  Pilih Waktu — {new Date(selectedDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h4>

                {daySlots.length > 0 && (
                  <p className="mb-3 text-[10px] text-slate-400">
                    Pelatih available: {daySlots.map((s) => `${s.start_time.slice(0, 5)}–${s.end_time.slice(0, 5)}`).join(', ')}
                  </p>
                )}

                {sessionsOnDate.length > 0 && (
                  <div className="mb-3 rounded-lg bg-amber-50 p-2">
                    <p className="text-[10px] font-medium text-amber-700">
                      Sudah ada sesi di tanggal ini: {sessionsOnDate.map((s) => `${s.start_time?.slice(0, 5)}–${s.end_time?.slice(0, 5)}`).join(', ')}
                    </p>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-slate-500">Jam Mulai</label>
                    <input
                      type="time"
                      value={selectedTime.start}
                      onChange={(e) => setSelectedTime((p) => ({ ...p, start: e.target.value }))}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10px] font-medium text-slate-500">Jam Selesai</label>
                    <input
                      type="time"
                      value={selectedTime.end}
                      onChange={(e) => setSelectedTime((p) => ({ ...p, end: e.target.value }))}
                      className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                    />
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={submitting || !selectedTime.start || !selectedTime.end}
                  className="mt-4 w-full rounded-lg bg-sky-700 py-3 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
                >
                  {submitting ? 'Mengirim...' : 'Ajukan Jadwal'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Enrollment completed */}
        {(enrollment.status !== 'active' || enrollment.sessions_done >= enrollment.sessions_total) && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
            <p className="mt-3 text-sm font-semibold text-emerald-800">Paket sudah selesai</p>
            <p className="mt-1 text-xs text-emerald-600">Semua sesi telah terpenuhi. Terima kasih!</p>
          </div>
        )}
      </div>
    </div>
  )
}
