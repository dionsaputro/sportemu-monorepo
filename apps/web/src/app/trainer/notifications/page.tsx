import { createClient } from '@/lib/supabase/server'
import { Bell } from 'lucide-react'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(30)

  // Mark unread as read
  const unreadIds = notifications?.filter((n: any) => !n.is_read).map((n: any) => n.id) || []
  if (unreadIds.length > 0) {
    await supabase.from('notifications').update({ is_read: true }).in('id', unreadIds)
  }

  const typeIcons: Record<string, string> = {
    booking_proposed: '📅',
    booking_approved: '✅',
    booking_rejected: '❌',
    checkin_reminder: '⏰',
    payment_verified: '💰',
    payment_rejected: '🚫',
    invoice_created: '📄',
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-sky-900">Notifikasi</h1>

      {!notifications || notifications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-500">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any) => (
            <div
              key={notif.id}
              className={`rounded-xl border bg-white p-4 transition-colors ${
                !notif.is_read ? 'border-sky-200 bg-sky-50/30' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-lg">{typeIcons[notif.type] || '🔔'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-sky-900">{notif.title}</p>
                  {notif.body && <p className="mt-0.5 text-xs text-slate-500">{notif.body}</p>}
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    {new Date(notif.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
