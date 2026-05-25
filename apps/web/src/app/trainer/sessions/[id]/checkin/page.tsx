'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Camera, Upload, CheckCircle2 } from 'lucide-react'

export default function CheckInPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [session, setSession] = useState<any>(null)
  const [existingCheckIn, setExistingCheckIn] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [sessionId])

  async function loadData() {
    const supabase = createClient()
    const { data: sess } = await supabase
      .from('sessions')
      .select('*, enrollments(customers(full_name))')
      .eq('id', sessionId)
      .single()
    setSession(sess)

    const { data: checkins } = await supabase
      .from('check_ins')
      .select('*')
      .eq('session_id', sessionId)
    setExistingCheckIn(checkins)
    setLoading(false)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      const img = new Image()
      img.onload = () => {
        const maxWidth = 800
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.7)
      }
      img.src = URL.createObjectURL(file)
    })
  }

  async function handleUpload(type: 'check_in' | 'check_out') {
    if (!file) return
    setError('')
    setUploading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Compress
    const compressed = await compressImage(file)
    const timestamp = Date.now()
    const path = `${user!.id}/${sessionId}/${type}_${timestamp}.jpg`

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('check-in-photos')
      .upload(path, compressed, { contentType: 'image/jpeg' })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    // Insert check_in record
    const { error: insertError } = await supabase.from('check_ins').insert({
      session_id: sessionId,
      trainer_id: user!.id,
      type,
      photo_url: path,
    })

    if (insertError) {
      setError(insertError.message)
      setUploading(false)
      return
    }

    // If check_out, mark session as completed
    if (type === 'check_out') {
      await supabase.from('sessions').update({ status: 'completed' }).eq('id', sessionId)
    }

    setSuccess(type === 'check_in' ? 'Check-in berhasil! 💪' : 'Check-out berhasil! Sesi selesai 🎉')
    setFile(null)
    setPreview(null)
    setUploading(false)

    // Reload data
    await loadData()
  }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>
  }

  const hasCheckIn = existingCheckIn?.some((c: any) => c.type === 'check_in')
  const hasCheckOut = existingCheckIn?.some((c: any) => c.type === 'check_out')
  const currentAction = !hasCheckIn ? 'check_in' : !hasCheckOut ? 'check_out' : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/trainer/sessions/${sessionId}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-sky-900">
            {!hasCheckIn ? 'Check-in' : 'Check-out'}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {session?.enrollments?.customers?.full_name} • {session?.start_time?.slice(0, 5)} – {session?.end_time?.slice(0, 5)}
          </p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium text-emerald-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {/* Already completed */}
      {hasCheckIn && hasCheckOut && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="mt-3 text-sm font-semibold text-emerald-800">Sesi sudah selesai</p>
          <p className="mt-1 text-xs text-emerald-600">Check-in dan check-out sudah dilakukan</p>
        </div>
      )}

      {/* Camera / Upload */}
      {currentAction && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-medium text-sky-900">
            {currentAction === 'check_in' ? 'Foto Check-in' : 'Foto Check-out'}
          </h3>

          {!preview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-slate-200 py-16 transition-colors hover:border-sky-300 hover:bg-sky-50/30"
            >
              <Camera className="h-10 w-10 text-slate-400" />
              <p className="mt-3 text-sm font-medium text-slate-600">Ambil Foto</p>
              <p className="mt-1 text-xs text-slate-400">Tap untuk membuka kamera</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-xl">
                <img src={preview} alt="Preview" className="w-full object-cover" style={{ maxHeight: '400px' }} />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleUpload(currentAction)}
                  disabled={uploading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-sky-700 py-3 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Mengupload...' : `Konfirmasi ${currentAction === 'check_in' ? 'Check-in' : 'Check-out'}`}
                </button>
                <button
                  onClick={() => { setPreview(null); setFile(null) }}
                  className="rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Ulang
                </button>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  )
}
