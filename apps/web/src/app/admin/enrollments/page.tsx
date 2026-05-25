import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ClipboardList, Plus } from 'lucide-react'

export default async function EnrollmentsPage() {
  const supabase = await createClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, customers(full_name), trainers!inner(profiles(full_name)), packages(name)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Enrollment</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola pendaftaran customer ke paket</p>
        </div>
        <Link
          href="/admin/enrollments/new"
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
            <Link
              href="/admin/enrollments/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
            >
              <Plus className="h-4 w-4" />
              Buat Enrollment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Pelatih</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Paket</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Progress</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((enrollment: any) => (
                  <tr key={enrollment.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium text-sky-900">
                      {enrollment.customers?.full_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {enrollment.trainers?.profiles?.full_name || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {enrollment.packages?.name || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-sky-600"
                            style={{ width: `${(enrollment.sessions_done / enrollment.sessions_total) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {enrollment.sessions_done}/{enrollment.sessions_total}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                        enrollment.status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                        enrollment.status === 'completed' ? 'bg-sky-50 text-sky-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {enrollment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/enrollments/${enrollment.id}`}
                        className="text-xs font-medium text-sky-700 hover:text-sky-800"
                      >
                        Detail →
                      </Link>
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
