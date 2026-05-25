'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Users,
  UserCheck,
  ClipboardList,
  Receipt,
  Plus,
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Trophy,
  Activity,
  ArrowRight,
  Waves,
} from 'lucide-react'

type FilterPeriod = 'month' | 'year'

interface Session {
  id: string
  scheduled_date: string
  start_time: string
  end_time: string
  status: string
  enrollments: {
    customers: { full_name: string } | null
  } | null
  trainer_id: string
}

interface TrainerStat {
  trainer_id: string
  trainer_name: string
  sessions_completed: number
  specialty: string
}

export function DashboardClient({
  greeting,
  userName,
}: {
  greeting: string
  userName: string
}) {
  const [period, setPeriod] = useState<FilterPeriod>('month')
  const [stats, setStats] = useState({ trainers: 0, customers: 0, enrollments: 0, invoices: 0 })
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([])
  const [trainerStats, setTrainerStats] = useState<TrainerStat[]>([])
  const [recentActivity, setRecentActivity] = useState<{ text: string; time: string; type: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [period])

  async function fetchData() {
    setLoading(true)
    const supabase = createClient()

    const now = new Date()
    const startDate = period === 'month'
      ? new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      : new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0]
    const endDate = period === 'month'
      ? new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      : new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0]

    const [trainersRes, customersRes, enrollmentsRes, invoicesRes] = await Promise.all([
      supabase.from('trainers').select('id', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('customers').select('id', { count: 'exact', head: true }),
      supabase.from('enrollments').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('invoices').select('id', { count: 'exact', head: true }).in('status', ['sent', 'overdue']),
    ])

    setStats({
      trainers: trainersRes.count ?? 0,
      customers: customersRes.count ?? 0,
      enrollments: enrollmentsRes.count ?? 0,
      invoices: invoicesRes.count ?? 0,
    })

    const today = new Date().toISOString().split('T')[0]
    const { data: sessions } = await supabase
      .from('sessions')
      .select('id, scheduled_date, start_time, end_time, status, trainer_id, enrollments(customers(full_name))')
      .gte('scheduled_date', today)
      .in('status', ['approved', 'proposed'])
      .order('scheduled_date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(6)

    setUpcomingSessions((sessions as unknown as Session[]) || [])

    const { data: completedSessions } = await supabase
      .from('sessions')
      .select('trainer_id')
      .eq('status', 'completed')
      .gte('scheduled_date', startDate)
      .lte('scheduled_date', endDate)

    const { data: trainers } = await supabase
      .from('trainers')
      .select('id, specialty, profiles(full_name)')
      .eq('is_active', true)

    if (trainers && completedSessions) {
      const countMap: Record<string, number> = {}
      completedSessions.forEach((s) => {
        countMap[s.trainer_id] = (countMap[s.trainer_id] || 0) + 1
      })

      const ranked = trainers
        .map((t: any) => ({
          trainer_id: t.id,
          trainer_name: t.profiles?.full_name || 'Unknown',
          sessions_completed: countMap[t.id] || 0,
          specialty: t.specialty || '-',
        }))
        .sort((a: TrainerStat, b: TrainerStat) => b.sessions_completed - a.sessions_completed)

      setTrainerStats(ranked)
    }

    const { data: recentSessions } = await supabase
      .from('sessions')
      .select('id, scheduled_date, status, enrollments(customers(full_name))')
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(4)

    const activities: { text: string; time: string; type: string }[] = []
    if (recentSessions) {
      recentSessions.forEach((s: any) => {
        activities.push({
          text: `Sesi selesai — ${s.enrollments?.customers?.full_name || 'Customer'}`,
          time: s.scheduled_date,
          type: 'session',
        })
      })
    }

    const { data: recentInvoices } = await supabase
      .from('invoices')
      .select('invoice_number, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    if (recentInvoices) {
      recentInvoices.forEach((inv: any) => {
        activities.push({
          text: `Invoice ${inv.invoice_number} — ${inv.status}`,
          time: inv.created_at?.split('T')[0] || '',
          type: 'invoice',
        })
      })
    }

    setRecentActivity(activities.slice(0, 5))
    setLoading(false)
  }

  const statCards = [
    { label: 'Pelatih Aktif', value: stats.trainers, icon: UserCheck },
    { label: 'Total Customer', value: stats.customers, icon: Users },
    { label: 'Enrollment Aktif', value: stats.enrollments, icon: ClipboardList },
    { label: 'Invoice Pending', value: stats.invoices, icon: Receipt },
  ]

  // Mini calendar
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay()
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

  const sessionDays = new Set(
    upcomingSessions
      .filter((s) => {
        const d = new Date(s.scheduled_date)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })
      .map((s) => new Date(s.scheduled_date).getDate())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">
            {greeting}, {userName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Ringkasan aktivitas Sportemu
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setPeriod('month')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              period === 'month'
                ? 'bg-sky-700 text-white'
                : 'text-slate-500 hover:text-sky-900'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              period === 'year'
                ? 'bg-sky-700 text-white'
                : 'text-slate-500 hover:text-sky-900'
            }`}
          >
            Tahun Ini
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-sky-900">{loading ? '—' : stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-700/5">
                  <Icon className="h-5 w-5 text-sky-800" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Calendar + Upcoming */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Mini Calendar */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-sky-800" />
            <h3 className="text-sm font-medium text-sky-900">
              {monthNames[currentMonth]} {currentYear}
            </h3>
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {dayNames.map((d) => (
              <div key={d} className="py-1.5 text-center text-[10px] font-medium text-slate-400">
                {d}
              </div>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const isToday = day === today.getDate()
              const hasSession = sessionDays.has(day)
              return (
                <div
                  key={day}
                  className={`relative flex h-8 w-full items-center justify-center rounded-md text-xs transition-colors ${
                    isToday
                      ? 'bg-sky-700 font-semibold text-white'
                      : hasSession
                      ? 'bg-cyan-50 font-medium text-cyan-800'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {day}
                  {hasSession && !isToday && (
                    <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-cyan-600" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Training */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-sky-800" />
              <h3 className="text-sm font-medium text-sky-900">Sesi Mendatang</h3>
            </div>
            <a href="/admin/schedule" className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-sky-900">
              Lihat semua <ArrowRight className="h-3 w-3" />
            </a>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : upcomingSessions.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Waves className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">Belum ada sesi terjadwal</p>
              <p className="mt-1 text-xs text-slate-400">Sesi yang di-approve akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-4 rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
                >
                  {/* Time block */}
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-sky-700/5">
                    <span className="text-[10px] font-semibold text-sky-800">
                      {session.start_time?.slice(0, 5)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-sky-900">
                      {(session.enrollments as any)?.customers?.full_name || 'Customer'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(session.scheduled_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    session.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {session.status === 'approved' ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-sky-800" />
            <h3 className="text-sm font-medium text-sky-900">Aksi Cepat</h3>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: 'Tambah Customer', href: '/admin/customers/new', icon: Plus, desc: 'Daftarkan baru' },
              { label: 'Buat Enrollment', href: '/admin/enrollments', icon: FileText, desc: 'Assign ke paket' },
              { label: 'Lihat Jadwal', href: '/admin/schedule', icon: Calendar, desc: 'Kalender global' },
              { label: 'Verifikasi Bayar', href: '/admin/invoices', icon: CheckCircle2, desc: 'Cek pembayaran' },
            ].map((action) => {
              const Icon = action.icon
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sky-700/5">
                    <Icon className="h-4 w-4 text-sky-800" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-sky-900">{action.label}</p>
                    <p className="text-[10px] text-slate-500">{action.desc}</p>
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-800" />
            <h3 className="text-sm font-medium text-sky-900">Aktivitas Terbaru</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <Clock className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-500">Belum ada aktivitas</p>
              <p className="mt-1 text-xs text-slate-400">Aktivitas akan muncul setelah ada sesi</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-700/5">
                    {activity.type === 'session' ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-slate-600" />
                    ) : (
                      <Receipt className="h-3.5 w-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-sky-800">{activity.text}</p>
                    <p className="text-[10px] text-slate-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best Trainers */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-sky-800" />
          <h3 className="text-sm font-medium text-sky-900">
            Pelatih Terbaik — {period === 'month' ? 'Bulan Ini' : 'Tahun Ini'}
          </h3>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : trainerStats.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Trophy className="h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada data pelatih</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">#</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                  <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-500">Spesialisasi</th>
                  <th className="px-4 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sesi Selesai</th>
                </tr>
              </thead>
              <tbody>
                {trainerStats.map((trainer, i) => (
                  <tr key={trainer.trainer_id} className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {i + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-700 text-[10px] font-bold text-white">
                          {trainer.trainer_name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-sky-900">{trainer.trainer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                        {trainer.specialty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold text-sky-900">{trainer.sessions_completed}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
