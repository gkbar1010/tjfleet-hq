'use client'

import Link from 'next/link'
import {
  Car,
  CalendarCheck,
  CalendarClock,
  Clock,
  Wrench,
  Sparkles,
  ArrowUpRight,
  MessageSquare,
  TruckIcon,
} from 'lucide-react'

type BookingItem = {
  id: string
  customerName: string
  vehicleName: string
  time: string
  status: string
}

type InquiryItem = {
  id: string
  customerName: string
  vehicleName: string
  createdAt: string
  source: string
}

type DashboardData = {
  todaysPickups: BookingItem[]
  todaysDropoffs: BookingItem[]
  inquiryBookings: number
  pendingBookings: number
  confirmedBookings: number
  activeBookings: number
  availableCars: number
  carsOut: number
  inMaintenance: number
  needsCleaning: number
  recentInquiries: InquiryItem[]
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  accent,
}: {
  label: string
  value: number
  icon: React.ElementType
  href?: string
  accent?: boolean
}) {
  const content = (
    <div className={`bg-[#0e0e0e] border rounded-lg p-4 transition-all ${
      accent
        ? 'border-[#E10600]/30 hover:border-[#E10600]/50 hover:shadow-[0_0_20px_rgba(225,6,0,0.12)]'
        : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white" style={{ fontFamily: 'Orbitron, monospace' }}>{value}</p>
          <p className="text-[10px] text-[#555] mt-1.5 tracking-[0.12em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>{label}</p>
        </div>
        <Icon size={18} className={accent ? 'text-[#E10600]/50' : 'text-[#252525]'} />
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }
  return content
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatSourceLabel(source: string) {
  return source.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-[0.15em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
          Cruscotto
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <div className="h-[2px] w-10 bg-[#E10600]" style={{ boxShadow: '0 0 6px rgba(225,6,0,0.4)' }} />
          <span className="text-[9px] text-[#444] tracking-[0.2em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>Dashboard</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard
          label="Inquiries"
          value={data.inquiryBookings}
          icon={MessageSquare}
          href="/bookings?status=INQUIRY"
          accent
        />
        <StatCard
          label="Pending"
          value={data.pendingBookings}
          icon={CalendarClock}
          href="/bookings?status=PENDING"
          accent
        />
        <StatCard
          label="Confirmed"
          value={data.confirmedBookings}
          icon={CalendarCheck}
          href="/bookings?status=CONFIRMED"
        />
        <StatCard
          label="Active"
          value={data.activeBookings}
          icon={Clock}
          href="/bookings?status=ACTIVE"
          accent
        />
        <StatCard
          label="Available"
          value={data.availableCars}
          icon={Car}
          href="/fleet?status=AVAILABLE"
        />
        <StatCard
          label="Cars Out"
          value={data.carsOut}
          icon={TruckIcon}
          href="/fleet?status=BOOKED"
        />
        <StatCard
          label="Maintenance"
          value={data.inMaintenance}
          icon={Wrench}
          href="/fleet?status=IN_MAINTENANCE"
        />
        <StatCard
          label="Needs Cleaning"
          value={data.needsCleaning}
          icon={Sparkles}
          href="/fleet?status=NEEDS_CLEANING"
        />
      </div>

      {/* Today's sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Pickups */}
        <div>
          <h2 className="text-sm font-medium text-[#888] mb-3 tracking-[0.1em] uppercase">
            Today&apos;s Pickups
            <span className="text-[#E10600] ml-2">{data.todaysPickups.length}</span>
          </h2>
          {data.todaysPickups.length === 0 ? (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 text-sm text-[#444]">
              No pickups scheduled for today
            </div>
          ) : (
            <div className="space-y-2">
              {data.todaysPickups.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center justify-between bg-[#111] border border-[#1a1a1a] rounded-lg p-3 hover:border-[#E10600]/30 transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.vehicleName}</p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {b.customerName} &middot; {formatTime(b.time)}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="text-[#333] group-hover:text-[#E10600] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Dropoffs */}
        <div>
          <h2 className="text-sm font-medium text-[#888] mb-3 tracking-[0.1em] uppercase">
            Today&apos;s Dropoffs
            <span className="text-[#E10600] ml-2">{data.todaysDropoffs.length}</span>
          </h2>
          {data.todaysDropoffs.length === 0 ? (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 text-sm text-[#444]">
              No dropoffs scheduled for today
            </div>
          ) : (
            <div className="space-y-2">
              {data.todaysDropoffs.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center justify-between bg-[#111] border border-[#1a1a1a] rounded-lg p-3 hover:border-[#E10600]/30 transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.vehicleName}</p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {b.customerName} &middot; {formatTime(b.time)}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="text-[#333] group-hover:text-[#E10600] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Inquiries */}
      <div>
        <h2 className="text-sm font-medium text-[#888] mb-3 tracking-[0.1em] uppercase">
          Recent Inquiries
        </h2>
        {data.recentInquiries.length === 0 ? (
          <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 text-sm text-[#444]">
            No recent inquiries
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentInquiries.map((inq) => (
              <Link
                key={inq.id}
                href={`/bookings/${inq.id}`}
                className="flex items-center justify-between bg-[#111] border border-[#1a1a1a] rounded-lg p-3 hover:border-[#E10600]/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={14} className="text-[#333]" />
                  <div>
                    <p className="text-sm font-medium text-white">{inq.vehicleName}</p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {inq.customerName} &middot; {formatSourceLabel(inq.source)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#444]">
                    {new Date(inq.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <ArrowUpRight size={14} className="text-[#333] group-hover:text-[#E10600] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
