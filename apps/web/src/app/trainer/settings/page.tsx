'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, CreditCard, MapPin } from 'lucide-react'

export default function TrainerSettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [trainer, setTrainer] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const [profileRes, trainerRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user!.id).single(),
        supabase.from('trainers').select('*, cities!trainers_home_city_id_fkey(name), trainer_specialties(specialties(name))').eq('id', user!.id).single(),
        supabase.from('trainer_subscriptions').select('*, subscription_plans(name, max_clients, max_sessions_per_month, price_monthly)').eq('trainer_id', user!.id).in('status', ['free', 'active']).single(),
      ])

      setProfile(profileRes.data)
      setTrainer(trainerRes.data)
      setSubscription(subRes.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>

  const plan = subscription?.subscription_plans
  const specialties = (trainer?.trainer_specialties || []).map((ts: any) => ts.specialties?.name).filter(Boolean)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-sky-900">Settings</h1>

      {/* Profile */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-sky-800" />
          <h3 className="text-sm font-medium text-sky-900">Profil</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[10px] font-medium uppercase text-slate-400">Nama</p>
            <p className="mt-0.5 text-sm text-sky-900">{profile?.full_name}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase text-slate-400">Telepon</p>
            <p className="mt-0.5 text-sm text-slate-600">{profile?.phone || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase text-slate-400">Keahlian</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {specialties.length > 0 ? specialties.map((s: string) => (
                <span key={s} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600">{s}</span>
              )) : <span className="text-xs text-slate-400">Belum diset</span>}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase text-slate-400">Domisili</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600">
              <MapPin className="h-3 w-3" />
              {(trainer?.cities as any)?.name || 'Belum diset'}
            </p>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-sky-800" />
          <h3 className="text-sm font-medium text-sky-900">Subscription</h3>
        </div>
        {plan ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-sky-900">{plan.name}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                subscription.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-sky-50 text-sky-700'
              }`}>
                {subscription.status}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-500">Harga</p>
                <p className="text-sm font-semibold text-sky-900">
                  {plan.price_monthly === 0 ? 'Gratis' : `Rp ${Number(plan.price_monthly).toLocaleString('id-ID')}/bln`}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-500">Max Klien</p>
                <p className="text-sm font-semibold text-sky-900">{plan.max_clients === -1 ? 'Unlimited' : plan.max_clients}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] text-slate-500">Max Sesi/Bulan</p>
                <p className="text-sm font-semibold text-sky-900">{plan.max_sessions_per_month === -1 ? 'Unlimited' : plan.max_sessions_per_month}</p>
              </div>
            </div>
            {subscription.status === 'free' && (
              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-medium text-sky-800">Upgrade ke Pro?</p>
                <p className="mt-1 text-xs text-sky-600">Dapatkan lebih banyak klien, sesi unlimited, dan fitur premium lainnya.</p>
                <button className="mt-3 rounded-lg bg-sky-700 px-4 py-2 text-xs font-medium text-white hover:bg-sky-800">
                  Hubungi Admin untuk Upgrade
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Tidak ada subscription aktif</p>
        )}
      </div>
    </div>
  )
}
