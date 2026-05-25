import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Receipt } from 'lucide-react'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, enrollments(customers(full_name), trainers!inner(profiles(full_name)))')
    .order('created_at', { ascending: false })

  function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sky-900">Invoice</h1>
        <p className="mt-0.5 text-sm text-slate-500">Kelola invoice dan pembayaran</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {!invoices || invoices.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Receipt className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada invoice</p>
            <p className="mt-1 text-xs text-slate-400">Invoice akan otomatis dibuat saat enrollment selesai (postpaid)</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">No. Invoice</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jumlah</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Jatuh Tempo</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice: any) => (
                  <tr key={invoice.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-sm font-medium text-sky-900">{invoice.invoice_number}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">
                      {invoice.enrollments?.customers?.full_name || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-sm font-medium text-sky-900">
                      {formatPrice(invoice.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {invoice.due_date || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[invoice.status] || ''}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/invoices/${invoice.id}`}
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
