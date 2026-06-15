'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  Car,
  Users,
  BookOpen,
  Settings,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/bookings', label: 'Bookings', icon: BookOpen },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/fleet', label: 'Fleet', icon: Car },
  { href: '/settings/users', label: 'Settings', icon: Settings },
]

export default function Sidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-56 bg-neutral-900 border-r border-neutral-800 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-lg font-bold text-white">TJFleet HQ</h1>
        <p className="text-xs text-neutral-500 mt-0.5">Fleet Management</p>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'text-white bg-neutral-800'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800">
        <div className="text-sm text-white truncate">{userName}</div>
        <div className="text-xs text-neutral-500 capitalize">{userRole.toLowerCase()}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-neutral-500 hover:text-white mt-2 transition-colors"
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
