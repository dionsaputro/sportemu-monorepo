'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function TrainerNewEnrollmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [form, setForm] = useState({ customer_id: '', package_id: '', payment_type: 'prepaid', start_date: new Date().toISOString().split('T')[0], notes: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const [custRes, pkgRes] = await Promise.all([
        supabase.from('customers').select('id, full_name').eq('created_by', user!.id),
        supabase.from('packages').select('id, name, session_count, price').eq('is_active', true),
      ])
      setCustomers(custRes.data || [])
      setPackages(pkgRes.data || [])
    }
    load()
  }, [])

  function updateForm(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const pkg = packages.find(p => p.id === form.package_id)

    const { error: err } = await supabase.from('enrollments').insert({
      customer_id: form.customer_id,
      trainer_id: user!.id,
      package_id: form.package_id,
      payment_type: form.payment_type,
      start_date: form.start_date,
      sessions_total: pkg?.session_count || 0,
      notes: form.notes || null,
      created_by: user!.id,
    })

    if (err) { setError(err.message); setLoading(false); return }

    // Auto-invoice for prepaid
    if (form.payment_type === 'prepaid' && pkg) {
      const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number')
      if (invoiceNumber) {
        const { data: newEnr } = await supabase.from('enrollments').select('id').eq('customer_id', form.customer_id).eq('trainer_id', user!.id).eq('package_id', form.package_id).order('created_at', { ascending: false }).limit(1).single()
        if (newEnr) {
          const due = new Date(); due.setDate(due.getDate() + 7)
          await supabase.from('invoices').insert({ enrollment_id: newEnr.id, invoice_number: invoiceNumber, amount: pkg.price, status: 'sent', due_date: due.toISOString().split('T')[0] })
        }
      }
    }

    router.push('/trainer/enrollments')
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trainer/enrollments" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" /></Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Buat Enrollment</h1>
          <p className="mt-0.5 text-sm text-slate-500">Assign klien ke paket</p>
        </div>
      </div>

      <div className="max-w-lg rounded-xl border border-slate-200 bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Klien *</label>
            <select required value={form.customer_id} onChange={e => updateForm('customer_id', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20">
              <option value="">Pilih klien</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Paket *</label>
            <select required value={form.package_id} onChange={e => updateForm('package_id', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20">
              <option value="">Pilih paket</option>
              {packages.map(p => <option key={p.id} value={p.id}>{p.name} — {p.session_count} sesi — Rp {p.price?.toLocaleString('id-ID')}</option>)}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Tipe Bayar *</label>
              <select required value={form.payment_type} onChange={e => updateForm('payment_type', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20">
                <option value="prepaid">Prepaid — bayar dulu</option>
                <option value="postpaid">Postpaid — bayar nanti</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">Tanggal Mulai *</label>
              <input type="date" required value={form.start_date} onChange={e => updateForm('start_date', e.target.value)} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-700">Catatan</label>
            <textarea value={form.notes} onChange={e => updateForm('notes', e.target.value)} rows={2} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20" placeholder="Catatan..." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="rounded-lg bg-sky-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50">{loading ? 'Menyimpan...' : 'Buat Enrollment'}</button>
            <Link href="/trainer/enrollments" className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Batal</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
