'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Clock, Plus, Trash2 } from 'lucide-react'

const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

interface Slot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
}

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [newSlot, setNewSlot] = useState({ day_of_week: '1', start_time: '09:00', end_time: '12:00' })

  useEffect(() => {
    loadSlots()
  }, [])

  async function loadSlots() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase
      .from('trainer_availability')
      .select('*')
      .eq('trainer_id', user!.id)
      .eq('is_active', true)
      .order('day_of_week')
      .order('start_time')
    setSlots(data || [])
    setLoading(false)
  }

  async function addSlot() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from('trainer_availability').insert({
      trainer_id: user!.id,
      day_of_week: parseInt(newSlot.day_of_week),
      start_time: newSlot.start_time,
      end_time: newSlot.end_time,
    })

    setShowForm(false)
    setNewSlot({ day_of_week: '1', start_time: '09:00', end_time: '12:00' })
    setSaving(false)
    loadSlots()
  }

  async function removeSlot(id: string) {
    const supabase = createClient()
    await supabase.from('trainer_availability').update({ is_active: false }).eq('id', id)
    loadSlots()
  }

  // Group by day
  const grouped: Record<number, Slot[]> = {}
  slots.forEach((s) => {
    if (!grouped[s.day_of_week]) grouped[s.day_of_week] = []
    grouped[s.day_of_week].push(s)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Jadwal Available</h1>
          <p className="mt-0.5 text-sm text-slate-500">Atur waktu kamu bisa menerima sesi</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Slot
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-5">
          <h3 className="mb-3 text-sm font-medium text-sky-900">Tambah Slot Baru</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">Hari</label>
              <select
                value={newSlot.day_of_week}
                onChange={(e) => setNewSlot((p) => ({ ...p, day_of_week: e.target.value }))}
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600"
              >
                {dayNames.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">Mulai</label>
              <input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot((p) => ({ ...p, start_time: e.target.value }))}
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium text-slate-500">Selesai</label>
              <input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot((p) => ({ ...p, end_time: e.target.value }))}
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600"
              />
            </div>
            <button
              onClick={addSlot}
              disabled={saving}
              className="h-9 rounded-lg bg-sky-700 px-4 text-xs font-medium text-white hover:bg-sky-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Simpan'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Slots list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}
        </div>
      ) : slots.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <Clock className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">Belum ada jadwal</p>
          <p className="mt-1 text-xs text-slate-400">Tambahkan slot waktu kamu available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b)).map(([day, daySlots]) => (
            <div key={day} className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="mb-2 text-xs font-semibold text-sky-900">{dayNames[Number(day)]}</h3>
              <div className="space-y-1.5">
                {daySlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-sm text-slate-700">
                      {slot.start_time?.slice(0, 5)} – {slot.end_time?.slice(0, 5)}
                    </span>
                    <button
                      onClick={() => removeSlot(slot.id)}
                      className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
