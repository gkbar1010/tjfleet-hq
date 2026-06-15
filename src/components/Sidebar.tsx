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
    <aside className="w-56 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col h-screen sticky top-0 relative">
      {/* Italian stripe left edge */}
      <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-[#008C45] via-[#F2F2F2] to-[#DC0000]" />

      <div className="p-5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 border border-[#DC0000] rounded-full flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-[#DC0000] rounded-full" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-[0.12em] uppercase">TJFleet</h1>
            <p className="text-[10px] text-[#555] tracking-[0.15em] uppercase">HQ</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all relative ${
                isActive
                  ? 'text-white bg-[#DC0000]/10'
                  : 'text-[#666] hover:text-white hover:bg-[#ffffff05]'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-[#DC0000]" />
              )}
              <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
              <span className="tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#1a1a1a]">
        <div className="text-sm text-white truncate">{userName}</div>
        <div className="text-[10px] text-[#555] capitalize tracking-[0.1em] uppercase">{userRole.toLowerCase()}</div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-[#555] hover:text-[#DC0000] mt-2 transition-colors"
        >
          <LogOut size={12} />
          <span className="tracking-wide">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
