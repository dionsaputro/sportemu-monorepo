import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TrainerSidebar } from '@/components/trainer/sidebar'
import { TrainerBottomNav } from '@/components/trainer/bottom-nav'

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'trainer') {
    redirect('/admin')
  }

  return (
    <div className="flex h-screen">
      <TrainerSidebar userName={profile.full_name} />
      <main className="flex-1 overflow-y-auto bg-[#FAFBFC] pb-20 md:pb-0">
        <div className="mx-auto max-w-4xl p-6 md:p-8">
          {children}
        </div>
      </main>
      <TrainerBottomNav />
    </div>
  )
}
