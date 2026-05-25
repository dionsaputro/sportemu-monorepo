import { createClient } from '@/lib/supabase/server'

export default async function TrainerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  return (
    <div>
      <h1 className="text-2xl font-bold">
        Halo, {profile?.full_name}! 🏊‍♂️
      </h1>
      <p className="mt-1 text-muted-foreground">
        Ini sesi kamu hari ini.
      </p>

      {/* Today's sessions placeholder */}
      <div className="mt-6 rounded-xl border bg-card p-8 text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-3 font-medium">Belum ada sesi hari ini</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Nikmati hari bebasmu!
        </p>
      </div>
    </div>
  )
}
