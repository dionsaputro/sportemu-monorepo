import { createClient } from '@/lib/supabase/server'
import { CreditCard } from 'lucide-react'

export default async function PlansPage() {
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price_monthly', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sky-900">Subscription Plans</h1>
        <p className="mt-0.5 text-sm text-slate-500">Kelola plan dan limit platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans?.map((plan: any) => (
          <div key={plan.id} className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-sky-900">{plan.name}</h3>
              {plan.is_free && <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">Free</span>}
            </div>
            <p className="mt-3 text-2xl font-bold text-sky-900">
              {plan.price_monthly === 0 ? 'Gratis' : `Rp ${Number(plan.price_monthly).toLocaleString('id-ID')}`}
              {plan.price_monthly > 0 && <span className="text-sm font-normal text-slate-500">/bulan</span>}
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>Max klien: <strong>{plan.max_clients === -1 ? 'Unlimited' : plan.max_clients}</strong></p>
              <p>Max sesi/bulan: <strong>{plan.max_sessions_per_month === -1 ? 'Unlimited' : plan.max_sessions_per_month}</strong></p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium ${plan.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {(!plans || plans.length === 0) && (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <CreditCard className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">Belum ada plan</p>
        </div>
      )}
    </div>
  )
}
