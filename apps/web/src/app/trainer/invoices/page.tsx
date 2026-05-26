import { createClient } from '@/lib/supabase/server'
import { Receipt } from 'lucide-react'

export default async function TrainerInvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, enrollments!inner(trainer_id, customers(full_name))')
    .eq('enrollments.trainer_id', user!.id)
    .order('created_at', { ascending: false })

  function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
  }

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    sent: 'bg-amber-50 text-amber-700',
    paid: 'bg-emerald-50 text-emerald-700',
    overdue: 'bg-red-50 text-red-700',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sky-900">Invoice</h1>
        <p className="mt-0.5 text-sm text-slate-500">Invoice ke klien kamu</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {!invoices || invoices.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Receipt className="h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada invoice</p>
            <p className="mt-1 text-xs text-slate-400">Invoice otomatis dibuat saat enrollment selesai (postpaid) atau saat enrollment dibuat (prepaid)</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {invoices.map((inv: any) => (
              <div key={inv.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-900">{inv.enrollments?.customers?.full_name}</p>
                  <p className="text-xs text-slate-500">{inv.invoice_number} • {formatPrice(inv.amount)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusColors[inv.status] || ''}`}>
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
