import { createClient } from '@/lib/supabase/server'
import { Calendar } from 'lucide-react'

export default async function SchedulePage() {
  const supabase = await createClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, scheduled_date, start_time, end_time, status, trainer_id, enrollments(customers(full_name)), trainers!inner(profiles(full_name))')
    .in('status', ['proposed', 'approved', 'completed'])
    .order('scheduled_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(50)

  const statusColors: Record<string, string> = {
    proposed: 'border-l-amber-500 bg-amber-50/50',
    approved: 'border-l-sky-500 bg-sky-50/50',
    completed: 'border-l-emerald-500 bg-emerald-50/50',
  }

  const statusBadge: Record<string, string> = {
    proposed: 'bg-amber-50 text-amber-700',
    approved: 'bg-sky-50 text-sky-700',
    completed: 'bg-emerald-50 text-emerald-700',
  }

  // Group sessions by date
  const grouped: Record<string, any[]> = {}
  sessions?.forEach((s: any) => {
    if (!grouped[s.scheduled_date]) grouped[s.scheduled_date] = []
    grouped[s.scheduled_date].push(s)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sky-900">Jadwal</h1>
        <p className="mt-0.5 text-sm text-slate-500">Kalender global semua pelatih</p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <Calendar className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">Belum ada jadwal</p>
          <p className="mt-1 text-xs text-slate-400">Sesi akan muncul setelah enrollment dibuat</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateSessions]) => (
            <div key={date}>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
              <div className="space-y-2">
                {dateSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className={`rounded-lg border-l-4 border border-slate-100 p-4 ${statusColors[session.status] || ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-sky-900">{session.start_time?.slice(0, 5)}</p>
                          <p className="text-[10px] text-slate-500">{session.end_time?.slice(0, 5)}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-sky-900">
                            {session.enrollments?.customers?.full_name || 'Customer'}
                          </p>
                          <p className="text-xs text-slate-500">
                            Pelatih: {session.trainers?.profiles?.full_name || '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusBadge[session.status] || ''}`}>
                        {session.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
