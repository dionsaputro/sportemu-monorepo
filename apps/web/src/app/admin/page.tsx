import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from '@/components/admin/dashboard-client'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam'

  return (
    <DashboardClient
      greeting={greeting}
      userName={profile?.full_name?.split(' ')[0] || 'Admin'}
    />
  )
}
