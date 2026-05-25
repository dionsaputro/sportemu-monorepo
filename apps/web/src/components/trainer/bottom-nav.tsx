'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/trainer', label: 'Beranda', icon: '🏠' },
  { href: '/trainer/schedule', label: 'Jadwal', icon: '📅' },
  { href: '/trainer/sessions', label: 'Sesi', icon: '🏊' },
  { href: '/trainer/outstanding', label: 'Bayar', icon: '💰' },
  { href: '/trainer/notifications', label: 'Notif', icon: '🔔' },
]

export function TrainerBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card md:hidden">
      <div className="flex items-center justify-around">
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
                'flex min-w-[64px] flex-col items-center gap-0.5 px-2 py-3 text-xs transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
