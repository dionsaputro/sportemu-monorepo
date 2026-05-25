'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  UserCheck,
  Package,
  Users,
  ClipboardList,
  Receipt,
  Calendar,
  LogOut,
  Waves,
} from 'lucide-react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/trainers', label: 'Pelatih', icon: UserCheck },
  { href: '/admin/packages', label: 'Paket', icon: Package },
  { href: '/admin/customers', label: 'Customer', icon: Users },
  { href: '/admin/enrollments', label: 'Enrollment', icon: ClipboardList },
  { href: '/admin/invoices', label: 'Invoice', icon: Receipt },
  { href: '/admin/schedule', label: 'Jadwal', icon: Calendar },
]

export function AdminSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="flex w-[240px] flex-col border-r border-slate-200 bg-white">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-700">
          <Waves className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold text-sky-900">Sportemu</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
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
