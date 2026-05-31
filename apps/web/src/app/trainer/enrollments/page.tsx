import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'

export default async function TrainerEnrollmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, customers(full_name), packages(name)')
    .eq('trainer_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Enrollment</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola pendaftaran klien ke paket</p>
        </div>
        <Link
          href="/trainer/enrollments/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Buat Enrollment
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {!enrollments || enrollments.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <ClipboardList className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada enrollment</p>
            <Link href="/trainer/enrollments/new" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50">
              <Plus className="h-4 w-4" /> Buat Enrollment
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {enrollments.map((e: any) => (
              <Link key={e.id} href={`/trainer/enrollments/${e.id}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-slate-50">
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-900">{e.customers?.full_name}</p>
                  <p className="text-xs text-slate-500">{e.packages?.name} • {e.payment_type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-sky-600" style={{ width: `${(e.sessions_done / e.sessions_total) * 100}%` }} />
                    </div>
                    <span className="text-xs text-slate-500">{e.sessions_done}/{e.sessions_total}</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                    e.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                    e.status === 'completed' ? 'bg-sky-50 text-sky-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>{e.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
