import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-sky-900">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Konfigurasi platform</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
        <Settings className="mx-auto h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm font-medium text-slate-500">Coming soon</p>
        <p className="mt-1 text-xs text-slate-400">Halaman settings akan tersedia di update berikutnya</p>
      </div>
    </div>
  )
}
