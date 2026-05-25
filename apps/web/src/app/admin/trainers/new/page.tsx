'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Specialty {
  id: string
  name: string
}

interface City {
  id: string
  name: string
}

export default function NewTrainerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [cities, setCities] = useState<City[]>([])

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    bio: '',
    specialty_ids: [] as string[],
    home_city_id: '',
    available_city_ids: [] as string[],
  })

  useEffect(() => {
    async function loadOptions() {
      const supabase = createClient()
      const [specRes, cityRes] = await Promise.all([
        supabase.from('specialties').select('id, name').eq('is_active', true).order('name'),
        supabase.from('cities').select('id, name').eq('is_active', true).order('name'),
      ])
      setSpecialties(specRes.data || [])
      setCities(cityRes.data || [])
    }
    loadOptions()
  }, [])

  function updateForm(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function toggleSpecialty(id: string) {
    setForm((prev) => ({
      ...prev,
      specialty_ids: prev.specialty_ids.includes(id)
        ? prev.specialty_ids.filter((s) => s !== id)
        : [...prev.specialty_ids, id],
    }))
  }

  function toggleCity(id: string) {
    setForm((prev) => ({
      ...prev,
      available_city_ids: prev.available_city_ids.includes(id)
        ? prev.available_city_ids.filter((c) => c !== id)
        : [...prev.available_city_ids, id],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { role: 'trainer', full_name: form.full_name },
      },
    })

    if (authError || !authData.user) {
      setError(authError?.message || 'Gagal membuat user')
      setLoading(false)
      return
    }

    const userId = authData.user.id

    // 2. Update profile phone
    if (form.phone) {
      await supabase.from('profiles').update({ phone: form.phone }).eq('id', userId)
    }

    // 3. Create trainer record
    const { error: trainerError } = await supabase.from('trainers').insert({
      id: userId,
      specialty: form.specialty_ids.length > 0
        ? specialties.filter((s) => form.specialty_ids.includes(s.id)).map((s) => s.name).join(', ')
        : null,
      bio: form.bio || null,
      home_city_id: form.home_city_id || null,
    })

    if (trainerError) {
      setError(trainerError.message)
      setLoading(false)
      return
    }

    // 4. Insert trainer specialties
    if (form.specialty_ids.length > 0) {
      await supabase.from('trainer_specialties').insert(
        form.specialty_ids.map((sid) => ({ trainer_id: userId, specialty_id: sid }))
      )
    }

    // 5. Insert available cities
    if (form.available_city_ids.length > 0) {
      await supabase.from('trainer_available_cities').insert(
        form.available_city_ids.map((cid) => ({ trainer_id: userId, city_id: cid }))
      )
    }

    router.push('/admin/trainers')
    router.refresh()
  }

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
          <h1 className="text-xl font-semibold text-sky-900">Tambah Pelatih</h1>
          <p className="mt-0.5 text-sm text-slate-500">Daftarkan pelatih baru ke sistem</p>
        </div>
      </div>

      <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Account Info */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Informasi Akun</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) => updateForm('full_name', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                  placeholder="Nama lengkap pelatih"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => updateForm('email', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                  placeholder="email@contoh.com"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => updateForm('password', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                  placeholder="Min. 6 karakter"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">No. Telepon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm('phone', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                  placeholder="08xxxxxxxxxx"
                />
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Keahlian</h3>
            <div className="flex flex-wrap gap-2">
              {specialties.map((spec) => (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => toggleSpecialty(spec.id)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    form.specialty_ids.includes(spec.id)
                      ? 'border-sky-600 bg-sky-50 text-sky-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {spec.name}
                </button>
              ))}
              {specialties.length === 0 && (
                <p className="text-xs text-slate-400">Loading keahlian...</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Lokasi</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Domisili</label>
                <select
                  value={form.home_city_id}
                  onChange={(e) => updateForm('home_city_id', e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                >
                  <option value="">Pilih kota domisili</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700">Available Cities</label>
                <p className="mb-2 text-[10px] text-slate-400">Kota yang bisa dijangkau pelatih ini</p>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => toggleCity(city.id)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                        form.available_city_ids.includes(city.id)
                          ? 'border-sky-600 bg-sky-50 text-sky-700'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Lainnya</h3>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => updateForm('bio', e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
                placeholder="Deskripsi singkat tentang pelatih..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Pelatih'}
            </button>
            <Link
              href="/admin/trainers"
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
