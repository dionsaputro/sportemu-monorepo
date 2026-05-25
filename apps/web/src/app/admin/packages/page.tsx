import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Plus } from 'lucide-react'

export default async function PackagesPage() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false })

  function formatPrice(price: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Paket</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola paket latihan</p>
        </div>
        <Link
          href="/admin/packages/new"
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Paket
        </Link>
      </div>

      {!packages || packages.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">Belum ada paket</p>
          <Link
            href="/admin/packages/new"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-sky-700 hover:bg-sky-50"
          >
            <Plus className="h-4 w-4" />
            Tambah Paket
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg: any) => (
            <div
              key={pkg.id}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-sky-900">{pkg.name}</h3>
                  <p className="mt-1 text-xs text-slate-500">{pkg.description || 'Tidak ada deskripsi'}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  pkg.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {pkg.is_active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-xl font-bold text-sky-900">{formatPrice(pkg.price)}</span>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span>{pkg.session_count} sesi</span>
                <span>•</span>
                <span>{pkg.duration_days} hari</span>
              </div>
              <div className="mt-4 border-t border-slate-100 pt-3">
                <Link
                  href={`/admin/packages/${pkg.id}/edit`}
                  className="text-xs font-medium text-sky-700 hover:text-sky-800"
                >
                  Edit →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
