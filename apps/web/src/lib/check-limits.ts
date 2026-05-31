import { SupabaseClient } from '@supabase/supabase-js'

export interface PlanLimits {
  max_clients: number
  max_sessions_per_month: number
  plan_name: string
}

export interface UsageStatus {
  clients_used: number
  sessions_used_this_month: number
  limits: PlanLimits
  can_add_client: boolean
  can_add_session: boolean
  clients_remaining: number
  sessions_remaining: number
}

/**
 * Check trainer's current usage against their plan limits.
 * Returns usage status with boolean flags for enforcement.
 */
export async function checkTrainerLimits(
  supabase: SupabaseClient,
  trainerId: string
): Promise<UsageStatus | null> {
  // Get plan limits
  const { data: sub } = await supabase
    .from('trainer_subscriptions')
    .select('subscription_plans(max_clients, max_sessions_per_month, name)')
    .eq('trainer_id', trainerId)
    .in('status', ['free', 'active'])
    .single()

  if (!sub || !sub.subscription_plans) return null

  const limits: PlanLimits = {
    max_clients: (sub.subscription_plans as any).max_clients,
    max_sessions_per_month: (sub.subscription_plans as any).max_sessions_per_month,
    plan_name: (sub.subscription_plans as any).name,
  }

  // Count current clients
  const { count: clientCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', trainerId)

  // Count sessions this month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const { count: sessionCount } = await supabase
    .from('sessions')
    .select('id', { count: 'exact', head: true })
    .eq('trainer_id', trainerId)
    .gte('scheduled_date', monthStart)
    .lte('scheduled_date', monthEnd)

  const clients_used = clientCount || 0
  const sessions_used_this_month = sessionCount || 0

  // -1 means unlimited
  const can_add_client = limits.max_clients === -1 || clients_used < limits.max_clients
  const can_add_session = limits.max_sessions_per_month === -1 || sessions_used_this_month < limits.max_sessions_per_month

  const clients_remaining = limits.max_clients === -1 ? Infinity : Math.max(0, limits.max_clients - clients_used)
  const sessions_remaining = limits.max_sessions_per_month === -1 ? Infinity : Math.max(0, limits.max_sessions_per_month - sessions_used_this_month)

  return {
    clients_used,
    sessions_used_this_month,
    limits,
    can_add_client,
    can_add_session,
    clients_remaining,
    sessions_remaining,
  }
}
