import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock } from 'lucide-react'
import { notFound } from 'next/navigation'

export default async function TrainerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: trainer } = await supabase
    .from('trainers')
    .select('*, profiles(full_name, phone, email:id), trainer_specialties(specialties(name)), trainer_available_cities(cities(name)), cities!trainers_home_city_id_fkey(name)')
    .eq('id', id)
    .single()

  if (!trainer) notFound()

  const { data: availability } = await supabase
    .from('trainer_availability')
    .select('*')
    .eq('trainer_id', id)
    .eq('is_active', true)
    .order('day_of_week')

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, customers(full_name), packages(name)')
    .eq('trainer_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  const specialtyNames = (trainer.trainer_specialties || []).map((ts: any) => ts.specialties?.name).filter(Boolean)
  const cityNames = (trainer.trainer_available_cities || []).map((tc: any) => tc.cities?.name).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/trainers"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">{trainer.profiles?.full_name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">Detail pelatih</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Info Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-700 text-lg font-bold text-white">
              {trainer.profiles?.full_name?.charAt(0)}
            </div>
            <div>
              <p className="font-medium text-sky-900">{trainer.profiles?.full_name}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                trainer.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {trainer.is_active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            {specialtyNames.length > 0 && (
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-400">Keahlian</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {specialtyNames.map((s: string) => (
                    <span key={s} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600">{s}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-[10px] font-medium uppercase text-slate-400">Tipe Bayar</p>
              <p className="mt-0.5 text-slate-700">{trainer.payment_type === 'prepaid' ? 'Prepaid' : 'Postpaid'}</p>
            </div>

            {(trainer.cities as any)?.name && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-700">{(trainer.cities as any).name}</span>
              </div>
            )}

            {cityNames.length > 0 && (
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-400">Area Jangkauan</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {cityNames.map((c: string) => (
                    <span key={c} className="rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {trainer.bio && (
              <div>
                <p className="text-[10px] font-medium uppercase text-slate-400">Bio</p>
                <p className="mt-0.5 text-slate-600">{trainer.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-4 w-4 text-sky-800" />
            <h3 className="text-sm font-medium text-sky-900">Jadwal Available</h3>
          </div>
          {!availability || availability.length === 0 ? (
            <p className="text-xs text-slate-400">Belum diatur</p>
          ) : (
            <div className="space-y-2">
              {availability.map((slot: any) => (
                <div key={slot.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-xs font-medium text-slate-700">{dayNames[slot.day_of_week]}</span>
                  <span className="text-xs text-slate-500">{slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Enrollments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-medium text-sky-900">Enrollment Terbaru</h3>
          {!enrollments || enrollments.length === 0 ? (
            <p className="text-xs text-slate-400">Belum ada enrollment</p>
          ) : (
            <div className="space-y-2">
              {enrollments.map((e: any) => (
                <Link
                  key={e.id}
                  href={`/admin/enrollments/${e.id}`}
                  className="block rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
                >
                  <p className="text-xs font-medium text-sky-900">{e.customers?.full_name}</p>
                  <p className="text-[10px] text-slate-500">{e.packages?.name} • {e.sessions_done}/{e.sessions_total} sesi</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
