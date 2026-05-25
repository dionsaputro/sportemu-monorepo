'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Calendar, Waves, Receipt, Bell } from 'lucide-react'

const navItems = [
  { href: '/trainer', label: 'Beranda', icon: LayoutDashboard },
  { href: '/trainer/schedule', label: 'Jadwal', icon: Calendar },
  { href: '/trainer/sessions', label: 'Sesi', icon: Waves },
  { href: '/trainer/outstanding', label: 'Bayar', icon: Receipt },
  { href: '/trainer/notifications', label: 'Notif', icon: Bell },
]

export function TrainerBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/trainer'
              ? pathname === '/trainer'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-w-[56px] flex-col items-center gap-0.5 px-2 py-3 transition-colors',
                isActive
                  ? 'text-sky-700'
                  : 'text-slate-400'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'text-sky-700')} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
