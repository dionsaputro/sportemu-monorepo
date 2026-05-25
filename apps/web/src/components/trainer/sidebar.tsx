'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/trainer', label: 'Beranda', icon: '🏠' },
  { href: '/trainer/schedule', label: 'Jadwal', icon: '📅' },
  { href: '/trainer/sessions', label: 'Sesi', icon: '🏊' },
  { href: '/trainer/availability', label: 'Slot', icon: '⏰' },
  { href: '/trainer/outstanding', label: 'Outstanding', icon: '💰' },
  { href: '/trainer/notifications', label: 'Notifikasi', icon: '🔔' },
]

export function TrainerSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <span className="text-2xl">🏊</span>
        <span className="text-lg font-bold text-foreground">Sportemu</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === '/trainer'
              ? pathname === '/trainer'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">Trainer</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-lg border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Keluar
        </button>
      </div>
    </aside>
  )
}
