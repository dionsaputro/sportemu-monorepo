import { createClient } from '@/lib/supabase/server'
import { Receipt } from 'lucide-react'

export default async function OutstandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get trainer info
  const { data: trainer } = await supabase
    .from('trainers')
    .select('payment_type')
    .eq('id', user!.id)
    .single()

  // Get enrollments with invoice info
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, customers(full_name), packages(name, price), invoices(id, invoice_number, amount, status, payments(status))')
    .eq('trainer_id', user!.id)
    .in('status', ['active', 'completed'])

  const isPrepaid = trainer?.payment_type === 'prepaid'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sky-900">Outstanding</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {isPrepaid ? 'Sesi yang sudah dibayar tapi belum dijalankan' : 'Invoice yang belum dibayar'}
        </p>
      </div>

      {!enrollments || enrollments.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <Receipt className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">Tidak ada outstanding</p>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((enrollment: any) => {
            const outstanding = isPrepaid
              ? enrollment.sessions_total - enrollment.sessions_done
              : (enrollment.invoices || [])
                  .filter((inv: any) => ['sent', 'overdue'].includes(inv.status))
                  .reduce((sum: number, inv: any) => sum + inv.amount, 0)

            if (outstanding <= 0) return null

            return (
              <div key={enrollment.id} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-sky-900">{enrollment.customers?.full_name}</p>
                    <p className="text-xs text-slate-500">{enrollment.packages?.name}</p>
                  </div>
                  <div className="text-right">
                    {isPrepaid ? (
                      <p className="text-lg font-bold text-sky-900">{outstanding} sesi</p>
                    ) : (
                      <p className="text-lg font-bold text-sky-900">
                        Rp {outstanding.toLocaleString('id-ID')}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {isPrepaid ? 'sesi belum dijalankan' : 'belum dibayar'}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
