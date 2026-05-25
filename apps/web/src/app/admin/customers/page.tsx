import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Plus } from 'lucide-react'

export default async function CustomersPage() {
  const supabase = await createClient()

  const { data: customers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Customer</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola data customer</p>
        </div>
        <Link
          href="/admin/customers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Customer
        </Link>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {!customers || customers.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Users className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada customer</p>
            <Link
              href="/admin/customers/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
            >
              <Plus className="h-4 w-4" />
              Tambah Customer
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Nama</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Telepon</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Email</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Catatan</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer: any) => (
                  <tr key={customer.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-sky-900">{customer.full_name}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{customer.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{customer.email || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">{customer.notes || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/customers/${customer.id}`}
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
