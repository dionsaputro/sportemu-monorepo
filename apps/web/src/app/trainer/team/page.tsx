'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Plus, Crown, UserCheck, Copy, Check } from 'lucide-react'

interface OrgMember {
  id: string
  role: string
  is_active: boolean
  trainer_id: string
  trainer_name: string
  specialty: string | null
  joined_at: string | null
}

export default function TeamPage() {
  const [org, setOrg] = useState<any>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user owns or belongs to an org
    const { data: ownedOrg } = await supabase
      .from('organizations')
      .select('*')
      .eq('owner_id', user!.id)
      .single()

    if (ownedOrg) {
      setOrg(ownedOrg)
      const { data: orgMembers } = await supabase
        .from('organization_members')
        .select('*, trainers(specialty, profiles(full_name))')
        .eq('organization_id', ownedOrg.id)
        .order('role')

      setMembers((orgMembers || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        is_active: m.is_active,
        trainer_id: m.trainer_id,
        trainer_name: m.trainers?.profiles?.full_name || '—',
        specialty: m.trainers?.specialty,
        joined_at: m.joined_at,
      })))
    } else {
      // Check membership
      const { data: membership } = await supabase
        .from('organization_members')
        .select('*, organizations(name, slug)')
        .eq('trainer_id', user!.id)
        .single()

      if (membership) {
        setOrg({ ...membership.organizations, isMember: true })
      }
    }
    setLoading(false)
  }

  async function createOrg() {
    if (!orgName.trim()) return
    setSaving(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const slug = orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

    const { data: newOrg, error: orgErr } = await supabase
      .from('organizations')
      .insert({ name: orgName, slug, owner_id: user!.id })
      .select()
      .single()

    if (orgErr) { setError(orgErr.message); setSaving(false); return }

    // Add owner as member
    await supabase.from('organization_members').insert({
      organization_id: newOrg.id,
      trainer_id: user!.id,
      role: 'owner',
      joined_at: new Date().toISOString(),
    })

    // Update trainer record
    await supabase.from('trainers').update({ organization_id: newOrg.id }).eq('id', user!.id)

    setSaving(false)
    setShowCreate(false)
    loadData()
  }

  async function inviteMember() {
    if (!inviteEmail.trim() || !org) return
    setSaving(true)
    setError('')

    const supabase = createClient()

    // Find trainer by email (via profiles)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'trainer')
      .ilike('full_name', `%${inviteEmail}%`) // Simplified — in production use email lookup
      .single()

    if (!profile) {
      setError('Trainer tidak ditemukan. Pastikan mereka sudah terdaftar di Sportemu.')
      setSaving(false)
      return
    }

    const { error: invErr } = await supabase.from('organization_members').insert({
      organization_id: org.id,
      trainer_id: profile.id,
      role: 'trainer',
    })

    if (invErr) { setError(invErr.message); setSaving(false); return }

    // Update trainer's org
    await supabase.from('trainers').update({ organization_id: org.id }).eq('id', profile.id)

    setSaving(false)
    setShowInvite(false)
    setInviteEmail('')
    loadData()
  }

  const roleIcons: Record<string, typeof Crown> = { owner: Crown, admin: UserCheck, trainer: Users }

  if (loading) {
    return <div className="py-20 text-center text-sm text-slate-400">Loading...</div>
  }

  // No org yet — show create option
  if (!org) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Tim</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola tim pelatih kamu (Enterprise)</p>
        </div>

        {!showCreate ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">Belum punya organisasi</p>
            <p className="mt-1 text-xs text-slate-400">Buat organisasi untuk mengundang pelatih lain ke tim kamu</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
            >
              <Plus className="h-4 w-4" />
              Buat Organisasi
            </button>
          </div>
        ) : (
          <div className="max-w-md rounded-xl border border-slate-200 bg-white p-6">
            <h3 className="text-sm font-medium text-sky-900">Buat Organisasi</h3>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Nama studio/gym/tim"
              className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={createOrg} disabled={saving} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50">
                {saving ? 'Creating...' : 'Buat'}
              </button>
              <button onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Member view (not owner)
  if (org.isMember) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">Tim</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kamu bagian dari organisasi</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-600">Organisasi: <strong className="text-sky-900">{org.name}</strong></p>
        </div>
      </div>
    )
  }

  // Owner view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-sky-900">{org.name}</h1>
          <p className="mt-0.5 text-sm text-slate-500">{members.length} anggota tim</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800"
        >
          <Plus className="h-4 w-4" />
          Undang Pelatih
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-5">
          <h3 className="text-sm font-medium text-sky-900">Undang Pelatih</h3>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          <input
            type="text"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Nama pelatih yang sudah terdaftar"
            className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/20"
          />
          <div className="mt-3 flex gap-3">
            <button onClick={inviteMember} disabled={saving} className="rounded-lg bg-sky-700 px-4 py-2 text-sm font-medium text-white hover:bg-sky-800 disabled:opacity-50">
              {saving ? 'Mengundang...' : 'Undang'}
            </button>
            <button onClick={() => { setShowInvite(false); setError('') }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="divide-y divide-slate-50">
          {members.map((member) => {
            const RoleIcon = roleIcons[member.role] || Users
            return (
              <div key={member.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-700 text-[10px] font-bold text-white">
                  {member.trainer_name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-900">{member.trainer_name}</p>
                  <p className="text-xs text-slate-500">{member.specialty || 'Belum set'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <RoleIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-600">
                    {member.role}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
