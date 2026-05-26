import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus } from 'lucide-react'

export default async function TrainerClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get clients via enrollments (trainer's own clients)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('customer_id, customers(id, full_name, phone, email, city_id, cities(name))')
    .eq('trainer_id', user!.id)

  // Deduplicate clients
  const clientMap = new Map()
  enrollments?.forEach((e: any) => {
    if (e.customers && !clientMap.has(e.customers.id)) {
      clientMap.set(e.customers.id, e.customers)
    }
  })
  const clients = Array.from(clientMap.values())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Klien</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola klien kamu</p>
        </div>
        <Link
          href="/trainer/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Klien
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {clients.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada klien</p>
            <p className="mt-1 text-xs text-slate-400">Tambahkan klien pertama kamu</p>
            <Link
              href="/trainer/clients/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
            >
              <Plus className="h-4 w-4" />
              Tambah Klien
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Telepon</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Kota</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client: any) => (
                  <tr key={client.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5 text-sm font-medium text-sky-900">{client.full_name}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{client.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{client.cities?.name || '—'}</td>
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
