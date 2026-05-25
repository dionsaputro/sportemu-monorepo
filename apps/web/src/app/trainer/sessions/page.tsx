import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Waves, Plus } from 'lucide-react'

export default async function TrainerSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('*, enrollments(customers(full_name))')
    .eq('trainer_id', user!.id)
    .order('scheduled_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(30)

  const upcoming = sessions?.filter((s: any) => ['proposed', 'approved'].includes(s.status)) || []
  const completed = sessions?.filter((s: any) => s.status === 'completed') || []

  const statusColors: Record<string, string> = {
    proposed: 'bg-amber-50 text-amber-700',
    approved: 'bg-sky-50 text-sky-700',
    completed: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
  }

  function SessionRow({ session }: { session: any }) {
    return (
      <Link
        href={`/trainer/sessions/${session.id}`}
        className="flex items-center gap-4 rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50"
      >
        <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-sky-100">
          <span className="text-[10px] font-bold text-sky-800">
            {session.start_time?.slice(0, 5)}
          </span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-sky-900">
            {session.enrollments?.customers?.full_name || 'Customer'}
          </p>
          <p className="text-xs text-slate-500">
            {new Date(session.scheduled_date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
          </p>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[session.status] || ''}`}>
          {session.status}
        </span>
      </Link>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-sky-900">Sesi</h1>
        <Link
          href="/trainer/sessions/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Sesi
        </Link>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Mendatang</h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-10 text-center">
            <Waves className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">Belum ada sesi mendatang</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map((s: any) => <SessionRow key={s.id} session={s} />)}
          </div>
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Selesai</h2>
          <div className="space-y-2">
            {completed.map((s: any) => <SessionRow key={s.id} session={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}
