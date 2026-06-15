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
    <aside className="w-56 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col h-screen sticky top-0 relative">
      {/* Italian stripe left edge */}
      <div className="absolute top-0 left-0 bottom-0 w-[2px]">
        <div className="h-1/3 bg-[#008C45]" />
        <div className="h-1/3 bg-[#F2F2F2]" />
        <div className="h-1/3 bg-[#E10600]" />
      </div>

      {/* Logo area */}
      <div className="p-5 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-11 border border-[#E10600] rounded-t-md rounded-b-[30%] flex flex-col items-center justify-center flex-shrink-0"
            style={{ boxShadow: '0 0 12px rgba(225,6,0,0.15)' }}>
            <span className="text-[#E10600] font-bold text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>TJ</span>
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-[0.15em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
              TJFleet
            </h1>
            <p className="text-[8px] text-[#E10600] tracking-[0.25em] uppercase mt-0.5" style={{ fontFamily: 'Orbitron, monospace' }}>
              Headquarters
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all relative group ${
                isActive
                  ? 'text-white'
                  : 'text-[#555] hover:text-white'
              }`}
            >
              {/* Active indicator — racing red bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-[#E10600]"
                  style={{ boxShadow: '0 0 8px rgba(225,6,0,0.5)' }} />
              )}
              {/* Hover background */}
              <div className={`absolute inset-0 transition-opacity ${
                isActive ? 'bg-[#E10600]/8 opacity-100' : 'bg-white/[0.02] opacity-0 group-hover:opacity-100'
              }`} />

              <item.icon size={15} strokeWidth={isActive ? 2 : 1.5} className={isActive ? 'text-[#E10600]' : ''} />
              <span className="relative tracking-[0.05em] uppercase text-xs font-semibold">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-[#1a1a1a]">
        <div className="text-sm text-white font-semibold truncate">{userName}</div>
        <div className="text-[9px] text-[#E10600] tracking-[0.15em] uppercase mt-0.5" style={{ fontFamily: 'Orbitron, monospace' }}>
          {userRole.toLowerCase()}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-[#444] hover:text-[#E10600] mt-3 transition-colors tracking-wider uppercase"
        >
          <LogOut size={12} />
          <span>Esci</span>
        </button>
      </div>
    </aside>
  )
}
