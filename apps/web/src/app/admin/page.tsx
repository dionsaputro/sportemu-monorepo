import { createClient } from '@/lib/supabase/server'
import { Users, Receipt, Waves, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  // Platform metrics
  const [trainersRes, activeSubsRes, sessionsRes, plansRes] = await Promise.all([
    supabase.from('trainers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('trainer_subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('sessions').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('subscription_plans').select('*').eq('is_active', true).order('price_monthly'),
  ])

  // Recent trainer signups
  const { data: recentTrainers } = await supabase
    .from('trainers')
    .select('id, specialty, created_at, profiles(full_name, email:id), trainer_subscriptions(status, subscription_plans(name))')
    .order('created_at', { ascending: false })
    .limit(5)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'

  const stats = [
    { label: 'Total Trainer', value: trainersRes.count ?? 0, icon: Users },
    { label: 'Paid Subscribers', value: activeSubsRes.count ?? 0, icon: TrendingUp },
    { label: 'Total Sesi Platform', value: sessionsRes.count ?? 0, icon: Waves },
    { label: 'Plans Aktif', value: plansRes.data?.length ?? 0, icon: Receipt },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sky-900">{greeting}, {profile?.full_name?.split(' ')[0]}</h1>
        <p className="mt-0.5 text-sm text-slate-500">Platform metrics Sportemu</p>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-semibold text-sky-900">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100">
                  <Icon className="h-5 w-5 text-sky-800" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Plans overview */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-medium text-sky-900">Subscription Plans</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {plansRes.data?.map((plan: any) => (
            <div key={plan.id} className="rounded-lg border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-sky-900">{plan.name}</span>
                {plan.is_free && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">Free</span>}
              </div>
              <p className="mt-2 text-lg font-bold text-sky-900">
                {plan.price_monthly === 0 ? 'Gratis' : `Rp ${Number(plan.price_monthly).toLocaleString('id-ID')}/bln`}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {plan.max_clients === -1 ? 'Unlimited' : plan.max_clients} klien • {plan.max_sessions_per_month === -1 ? 'Unlimited' : plan.max_sessions_per_month} sesi/bln
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent trainers */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-medium text-sky-900">Trainer Terbaru</h3>
        {!recentTrainers || recentTrainers.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada trainer</p>
        ) : (
          <div className="space-y-2">
            {recentTrainers.map((trainer: any) => (
              <div key={trainer.id} className="flex items-center gap-3 rounded-lg border border-slate-100 px-4 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-700 text-[10px] font-bold text-white">
                  {trainer.profiles?.full_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-900">{trainer.profiles?.full_name}</p>
                  <p className="text-[10px] text-slate-500">{trainer.specialty || 'Belum set'}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                  trainer.trainer_subscriptions?.[0]?.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {trainer.trainer_subscriptions?.[0]?.subscription_plans?.name || 'Free'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
