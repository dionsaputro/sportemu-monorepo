import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { UserCheck, Plus, Search } from 'lucide-react'

export default async function TrainersPage() {
  const supabase = await createClient()

  const { data: trainers } = await supabase
    .from('trainers')
    .select('id, specialty, bio, payment_type, is_active, created_at, profiles(full_name, phone, email:id)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Pelatih</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola data pelatih Sportemu</p>
        </div>
        <Link
          href="/admin/trainers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Pelatih
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        {!trainers || trainers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <UserCheck className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada pelatih</p>
            <p className="mt-1 text-xs text-slate-400">Tambahkan pelatih pertama untuk memulai</p>
            <Link
              href="/admin/trainers/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 transition-colors hover:bg-sky-50"
            >
              <Plus className="h-4 w-4" />
              Tambah Pelatih
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Spesialisasi</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {trainers.map((trainer: any) => (
                  <tr key={trainer.id} className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-700 text-[11px] font-bold text-white">
                          {trainer.profiles?.full_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-sky-900">{trainer.profiles?.full_name || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                        {trainer.specialty || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        trainer.is_active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${trainer.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {trainer.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/trainers/${trainer.id}`}
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
