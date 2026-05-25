'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Waves, Calendar, Clock, ArrowRight, CheckCircle2, Share2, Copy, Check } from 'lucide-react'

interface Session {
  id: string
  scheduled_date: string
  start_time: string
  end_time: string
  status: string
  enrollments: { customers: { full_name: string } | null } | null
}

interface Enrollment {
  id: string
  booking_token: string
  customer_name: string
  sessions_done: number
  sessions_total: number
}

export function TrainerDashboardClient({
  greeting,
  userName,
  trainerId,
}: {
  greeting: string
  userName: string
  trainerId: string
}) {
  const [todaySessions, setTodaySessions] = useState<Session[]>([])
  const [pendingSessions, setPendingSessions] = useState<Session[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [stats, setStats] = useState({ completed: 0, active: 0 })
  const [loading, setLoading] = useState(true)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [allSessions, setAllSessions] = useState<Session[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const [todayRes, pendingRes, completedRes, activeRes, enrollRes, monthRes] = await Promise.all([
      supabase.from('sessions').select('*, enrollments(customers(full_name))').eq('trainer_id', trainerId).eq('scheduled_date', today).in('status', ['approved', 'proposed']).order('start_time'),
      supabase.from('sessions').select('*, enrollments(customers(full_name))').eq('trainer_id', trainerId).eq('status', 'proposed').order('scheduled_date').limit(5),
      supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId).eq('status', 'completed'),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('trainer_id', trainerId).eq('status', 'active'),
      supabase.from('enrollments').select('id, booking_token, sessions_done, sessions_total, customers(full_name)').eq('trainer_id', trainerId).eq('status', 'active'),
      supabase.from('sessions').select('id, scheduled_date, start_time, end_time, status, enrollments(customers(full_name))').eq('trainer_id', trainerId).in('status', ['approved', 'proposed', 'completed']).order('scheduled_date'),
    ])

    setTodaySessions((todayRes.data as unknown as Session[]) || [])
    setPendingSessions((pendingRes.data as unknown as Session[]) || [])
    setStats({ completed: completedRes.count || 0, active: activeRes.count || 0 })
    setEnrollments((enrollRes.data || []).map((e: any) => ({
      id: e.id,
      booking_token: e.booking_token,
      customer_name: e.customers?.full_name || '—',
      sessions_done: e.sessions_done,
      sessions_total: e.sessions_total,
    })))
    setAllSessions((monthRes.data as unknown as Session[]) || [])
    setLoading(false)
  }

  function copyBookingLink(token: string) {
    const url = `${window.location.origin}/book/${token}`
    navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // Calendar
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const sessionDays = new Map<number, string>()
  allSessions.forEach((s) => {
    const d = new Date(s.scheduled_date)
    if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
      sessionDays.set(d.getDate(), s.status)
    }
  })

  const statusBadge: Record<string, string> = {
    proposed: 'bg-amber-50 text-amber-700',
    approved: 'bg-sky-50 text-sky-700',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-sky-900">{greeting}, {userName}</h1>
        <p className="mt-0.5 text-sm text-slate-500">Ringkasan aktivitas kamu hari ini.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Sesi Hari Ini', value: loading ? '—' : todaySessions.length, icon: Calendar },
          { label: 'Klien Aktif', value: loading ? '—' : stats.active, icon: Waves },
          { label: 'Total Sesi Selesai', value: loading ? '—' : stats.completed, icon: CheckCircle2 },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-sky-900">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                  <Icon className="h-5 w-5 text-sky-800" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Calendar + Today's sessions */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Mini Calendar */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-sky-800" />
            <h3 className="text-sm font-medium text-sky-900">{monthNames[currentMonth]} {currentYear}</h3>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {dayNames.map((d) => (
              <div key={d} className="py-1.5 text-center text-[10px] font-medium text-slate-400">{d}</div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === today.getDate()
              const sessionStatus = sessionDays.get(day)
              return (
                <div
                  key={day}
                  className={`relative flex h-8 w-full items-center justify-center rounded-md text-xs transition-colors ${
                    isToday
                      ? 'bg-sky-700 font-semibold text-white'
                      : sessionStatus === 'approved'
                      ? 'bg-sky-50 font-medium text-sky-800'
                      : sessionStatus === 'proposed'
                      ? 'bg-amber-50 font-medium text-amber-700'
                      : sessionStatus === 'completed'
                      ? 'bg-emerald-50 font-medium text-emerald-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {day}
                  {sessionStatus && !isToday && (
                    <span className={`absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                      sessionStatus === 'approved' ? 'bg-sky-600' :
                      sessionStatus === 'proposed' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Today's sessions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-800" />
              <h3 className="text-sm font-medium text-sky-900">Sesi Hari Ini</h3>
            </div>
            <Link href="/trainer/sessions" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-700">
              Semua <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}</div>
          ) : todaySessions.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Waves className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">Tidak ada sesi hari ini</p>
              <p className="mt-1 text-xs text-slate-400">Nikmati hari bebasmu!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/trainer/sessions/${session.id}`}
                  className="flex items-center gap-4 rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-sky-100">
                    <span className="text-[10px] font-bold text-sky-800">{session.start_time?.slice(0, 5)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sky-900">{(session.enrollments as any)?.customers?.full_name || 'Customer'}</p>
                    <p className="text-xs text-slate-500">{session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge[session.status] || ''}`}>
                    {session.status === 'approved' ? 'Confirmed' : 'Pending'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Share Calendar Links */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Share2 className="h-4 w-4 text-sky-800" />
          <h3 className="text-sm font-medium text-sky-900">Share Kalender ke Klien</h3>
        </div>
        <p className="mb-4 text-xs text-slate-500">
          Kirim link ini ke klien biar mereka bisa booking jadwal sendiri.
        </p>
        {loading ? (
          <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}</div>
        ) : enrollments.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada klien aktif</p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-900">{enrollment.customer_name}</p>
                  <p className="text-[10px] text-slate-500">
                    {enrollment.sessions_done}/{enrollment.sessions_total} sesi
                  </p>
                </div>
                <button
                  onClick={() => copyBookingLink(enrollment.booking_token)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    copiedToken === enrollment.booking_token
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'border border-slate-200 text-slate-600 hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700'
                  }`}
                >
                  {copiedToken === enrollment.booking_token ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending approvals */}
      {!loading && pendingSessions.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <h3 className="text-sm font-medium text-sky-900">Menunggu Persetujuan</h3>
          </div>
          <div className="space-y-2">
            {pendingSessions.map((session) => (
              <Link
                key={session.id}
                href={`/trainer/sessions/${session.id}`}
                className="flex items-center gap-4 rounded-lg border border-amber-100 bg-white px-4 py-3 transition-colors hover:bg-amber-50"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-900">
                    {(session.enrollments as any)?.customers?.full_name || 'Customer'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(session.scheduled_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
                  </p>
                </div>
                <span className="text-xs font-medium text-sky-700">Review →</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
