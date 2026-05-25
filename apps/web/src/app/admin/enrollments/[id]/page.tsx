import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function EnrollmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, customers(full_name), trainers!inner(profiles(full_name)), packages(name, session_count, price)')
    .eq('id', id)
    .single()

  if (!enrollment) notFound()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('enrollment_id', id)
    .order('scheduled_date', { ascending: false })

  const statusColors: Record<string, string> = {
    proposed: 'bg-amber-50 text-amber-700',
    approved: 'bg-sky-50 text-sky-700',
    completed: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
    missed: 'bg-red-50 text-red-600',
  }

  const progress = enrollment.sessions_total > 0
    ? Math.round((enrollment.sessions_done / enrollment.sessions_total) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/enrollments"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-sky-900">
            {enrollment.customers?.full_name}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {enrollment.packages?.name} • Pelatih: {enrollment.trainers?.profiles?.full_name}
          </p>
        </div>
        <Link
          href={`/admin/enrollments/${id}/sessions/new`}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Propose Sesi
        </Link>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-medium uppercase text-slate-400">Status</p>
          <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
            enrollment.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
            enrollment.status === 'completed' ? 'bg-sky-50 text-sky-700' :
            'bg-slate-100 text-slate-500'
          }`}>
            {enrollment.status}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-medium uppercase text-slate-400">Progress</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-sky-600" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-semibold text-sky-900">{enrollment.sessions_done}/{enrollment.sessions_total}</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-medium uppercase text-slate-400">Tipe Bayar</p>
          <p className="mt-1 text-sm font-medium text-sky-900">{enrollment.payment_type}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-[10px] font-medium uppercase text-slate-400">Mulai</p>
          <p className="mt-1 text-sm font-medium text-sky-900">{enrollment.start_date}</p>
        </div>
      </div>

      {/* Sessions */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-medium text-sky-900">Daftar Sesi</h3>
        </div>
        {!sessions || sessions.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">Belum ada sesi</p>
            <Link
              href={`/admin/enrollments/${id}/sessions/new`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-800"
            >
              <Plus className="h-3 w-3" />
              Propose sesi pertama
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {sessions.map((session: any) => (
              <div key={session.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-20 text-center">
                  <p className="text-xs font-semibold text-sky-900">{session.start_time?.slice(0, 5)}</p>
                  <p className="text-[10px] text-slate-400">{session.end_time?.slice(0, 5)}</p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-700">
                    {new Date(session.scheduled_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {session.notes && <p className="text-[10px] text-slate-400">{session.notes}</p>}
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[session.status] || ''}`}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
