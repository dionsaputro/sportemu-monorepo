'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface Trainer {
  id: string
  full_name: string
  specialty: string | null
  available_cities: string[]
}

interface Customer {
  id: string
  full_name: string
  city_name: string | null
  city_id: string | null
}

interface Package {
  id: string
  name: string
  session_count: number
  price: number
}

export default function NewEnrollmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [packages, setPackages] = useState<Package[]>([])
  const [cityWarning, setCityWarning] = useState('')

  const [form, setForm] = useState({
    customer_id: '',
    trainer_id: '',
    package_id: '',
    payment_type: 'prepaid' as 'prepaid' | 'postpaid',
    start_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const [trainerRes, customerRes, packageRes] = await Promise.all([
        supabase.from('trainers').select('id, specialty, payment_type, profiles(full_name), trainer_available_cities(city_id, cities(name))').eq('is_active', true),
        supabase.from('customers').select('id, full_name, city_id, cities(name)'),
        supabase.from('packages').select('id, name, session_count, price').eq('is_active', true),
      ])

      setTrainers(
        (trainerRes.data || []).map((t: any) => ({
          id: t.id,
          full_name: t.profiles?.full_name || '—',
          specialty: t.specialty,
          available_cities: (t.trainer_available_cities || []).map((c: any) => c.cities?.name).filter(Boolean),
        }))
      )

      setCustomers(
        (customerRes.data || []).map((c: any) => ({
          id: c.id,
          full_name: c.full_name,
          city_name: c.cities?.name || null,
          city_id: c.city_id,
        }))
      )

      setPackages(packageRes.data || [])
    }
    loadData()
  }, [])

  // Check city compatibility when trainer + customer selected
  useEffect(() => {
    if (!form.trainer_id || !form.customer_id) {
      setCityWarning('')
      return
    }

    const trainer = trainers.find((t) => t.id === form.trainer_id)
    const customer = customers.find((c) => c.id === form.customer_id)

    if (trainer && customer && customer.city_name && trainer.available_cities.length > 0) {
      if (!trainer.available_cities.includes(customer.city_name)) {
        setCityWarning(`${trainer.full_name} belum cover area ${customer.city_name}. Tetap bisa dilanjutkan.`)
      } else {
        setCityWarning('')
      }
    } else {
      setCityWarning('')
    }
  }, [form.trainer_id, form.customer_id, trainers, customers])

  // No longer auto-set payment type from trainer — admin chooses freely

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const pkg = packages.find((p) => p.id === form.package_id)

    const { error: insertError } = await supabase.from('enrollments').insert({
      customer_id: form.customer_id,
      trainer_id: form.trainer_id,
      package_id: form.package_id,
      payment_type: form.payment_type,
      start_date: form.start_date,
      sessions_total: pkg?.session_count || 0,
      notes: form.notes || null,
      created_by: user?.id,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    // Auto-create invoice for prepaid enrollments
    if (form.payment_type === 'prepaid' && form.package_id) {
      const pkg = packages.find((p) => p.id === form.package_id)
      if (pkg) {
        // Generate invoice number via RPC
        const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number')

        if (invoiceNumber) {
          const dueDate = new Date()
          dueDate.setDate(dueDate.getDate() + 7) // 7 days to pay for prepaid

          // Get the enrollment we just created
          const { data: newEnrollment } = await supabase
            .from('enrollments')
            .select('id')
            .eq('customer_id', form.customer_id)
            .eq('trainer_id', form.trainer_id)
            .eq('package_id', form.package_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (newEnrollment) {
            await supabase.from('invoices').insert({
              enrollment_id: newEnrollment.id,
              invoice_number: invoiceNumber,
              amount: pkg.price,
              status: 'sent',
              due_date: dueDate.toISOString().split('T')[0],
              notes: 'Invoice prepaid — bayar sebelum sesi dimulai',
            })
          }
        }
      }
    }

    router.push('/admin/enrollments')
    router.refresh()
  }

  const selectedPkg = packages.find((p) => p.id === form.package_id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/enrollments"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Buat Enrollment</h1>
          <p className="mt-0.5 text-sm text-slate-500">Assign customer ke paket latihan</p>
        </div>
      </div>

      <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>
          )}

          {cityWarning && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {cityWarning}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Customer *</label>
            <select
              required
              value={form.customer_id}
              onChange={(e) => updateForm('customer_id', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            >
              <option value="">Pilih customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}{c.city_name ? ` — ${c.city_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Pelatih *</label>
            <select
              required
              value={form.trainer_id}
              onChange={(e) => updateForm('trainer_id', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            >
              <option value="">Pilih pelatih</option>
              {trainers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.full_name}{t.specialty ? ` (${t.specialty})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Paket *</label>
            <select
              required
              value={form.package_id}
              onChange={(e) => updateForm('package_id', e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            >
              <option value="">Pilih paket</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.session_count} sesi — Rp {p.price.toLocaleString('id-ID')}
                </option>
              ))}
            </select>
            {selectedPkg && (
              <p className="mt-1.5 text-[10px] text-slate-500">
                {selectedPkg.session_count} sesi • Rp {selectedPkg.price.toLocaleString('id-ID')}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Tanggal Mulai *</label>
              <input
                type="date"
                required
                value={form.start_date}
                onChange={(e) => updateForm('start_date', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Tipe Bayar *</label>
              <select
                required
                value={form.payment_type}
                onChange={(e) => updateForm('payment_type', e.target.value)}
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              >
                <option value="prepaid">Prepaid — bayar dulu</option>
                <option value="postpaid">Postpaid — bayar nanti</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Catatan</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateForm('notes', e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              placeholder="Catatan tambahan..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Buat Enrollment'}
            </button>
            <Link
              href="/admin/enrollments"
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
