'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Calendar,
  Waves,
  Clock,
  Receipt,
  Bell,
  LogOut,
  Plus,
  Users,
  Package,
  ClipboardList,
  UsersRound,
  Settings,
} from 'lucide-react'

const navItems = [
  { href: '/trainer', label: 'Beranda', icon: LayoutDashboard },
  { href: '/trainer/clients', label: 'Klien', icon: Users },
  { href: '/trainer/packages', label: 'Paket', icon: Package },
  { href: '/trainer/enrollments', label: 'Enrollment', icon: ClipboardList },
  { href: '/trainer/schedule', label: 'Jadwal', icon: Calendar },
  { href: '/trainer/sessions', label: 'Sesi', icon: Waves },
  { href: '/trainer/availability', label: 'Slot', icon: Clock },
  { href: '/trainer/invoices', label: 'Invoice', icon: Receipt },
  { href: '/trainer/team', label: 'Tim', icon: UsersRound },
  { href: '/trainer/notifications', label: 'Notifikasi', icon: Bell },
  { href: '/trainer/settings', label: 'Settings', icon: Settings },
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
    <aside className="hidden w-[240px] flex-col border-r border-slate-200 bg-white md:flex">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-700">
          <Waves className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-sky-900">Sportemu</span>
        <span className="ml-auto rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
          Trainer
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 pt-2">
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
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors',
                isActive
                  ? 'bg-sky-700 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-sky-900'
              )}
            >
              <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-slate-500')} />
              {item.label}
            </Link>
          )
        })}

        {/* Quick action */}
        <div className="pt-3">
          <Link
            href="/trainer/sessions/new"
            className="flex items-center gap-2.5 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-500 transition-colors hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            <Plus className="h-4 w-4" />
            Tambah Sesi
          </Link>
        </div>
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-700 text-[10px] font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </div>
          <span className="flex-1 truncate text-[13px] font-medium text-slate-700">{userName}</span>
          <button
            onClick={handleLogout}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="Keluar"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
