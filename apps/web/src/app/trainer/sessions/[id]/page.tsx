'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Check, X } from 'lucide-react'

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  useEffect(() => {
    loadSession()
  }, [sessionId])

  async function loadSession() {
    const supabase = createClient()
    const { data } = await supabase
      .from('sessions')
      .select('*, enrollments(customers(full_name), packages(name))')
      .eq('id', sessionId)
      .single()
    setSession(data)
    setLoading(false)
  }

  async function handleApprove() {
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('sessions').update({ status: 'approved' }).eq('id', sessionId)
    router.push('/trainer/sessions')
    router.refresh()
  }

  async function handleReject() {
    if (!rejectionReason.trim()) return
    setActionLoading(true)
    const supabase = createClient()
    await supabase.from('sessions').update({
      status: 'rejected',
      rejection_reason: rejectionReason,
    }).eq('id', sessionId)
    router.push('/trainer/sessions')
    router.refresh()
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>
  }

  if (!session) {
    return <div className="py-20 text-center text-sm text-slate-400">Sesi tidak ditemukan</div>
  }

  const statusColors: Record<string, string> = {
    proposed: 'bg-amber-50 text-amber-700 border-amber-200',
    approved: 'bg-sky-50 text-sky-700 border-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/trainer/sessions"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold text-sky-900">Detail Sesi</h1>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-semibold text-sky-900">
              {session.enrollments?.customers?.full_name}
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              {session.enrollments?.packages?.name}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[session.status] || ''}`}>
            {session.status}
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-medium uppercase text-slate-400">Tanggal</p>
            <p className="mt-0.5 text-sm font-medium text-sky-900">
              {new Date(session.scheduled_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase text-slate-400">Waktu</p>
            <p className="mt-0.5 text-sm font-medium text-sky-900">
              {session.start_time?.slice(0, 5)} – {session.end_time?.slice(0, 5)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase text-slate-400">Sumber</p>
            <p className="mt-0.5 text-sm text-slate-600">
              {session.booking_source === 'customer_propose' ? 'Diajukan customer' : 'Slot trainer'}
            </p>
          </div>
        </div>

        {session.notes && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3">
            <p className="text-[10px] font-medium uppercase text-slate-400">Catatan</p>
            <p className="mt-0.5 text-sm text-slate-600">{session.notes}</p>
          </div>
        )}

        {session.rejection_reason && (
          <div className="mt-4 rounded-lg bg-red-50 p-3">
            <p className="text-[10px] font-medium uppercase text-red-400">Alasan Ditolak</p>
            <p className="mt-0.5 text-sm text-red-700">{session.rejection_reason}</p>
          </div>
        )}
      </div>

      {/* Actions for proposed sessions */}
      {session.status === 'proposed' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-medium text-sky-900">Tindakan</h3>

          {!showRejectForm ? (
            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Reject
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Alasan penolakan..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Konfirmasi Reject
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-in button for approved sessions */}
      {session.status === 'approved' && (
        <Link
          href={`/trainer/sessions/${sessionId}/checkin`}
          className="block rounded-xl border border-sky-200 bg-sky-50 p-6 text-center transition-colors hover:bg-sky-100"
        >
          <p className="text-sm font-semibold text-sky-800">Check-in untuk sesi ini</p>
          <p className="mt-1 text-xs text-sky-600">Ambil foto dan konfirmasi kehadiran</p>
        </Link>
      )}
    </div>
  )
}
