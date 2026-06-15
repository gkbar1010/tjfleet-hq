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
    <div className={`bg-[#111] border rounded-lg p-4 transition-all ${
      accent
        ? 'border-[#DC0000]/30 hover:border-[#DC0000]/50 hover:shadow-[0_0_15px_rgba(220,0,0,0.1)]'
        : 'border-[#1a1a1a] hover:border-[#2a2a2a]'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-xs text-[#666] mt-1 tracking-wide uppercase">{label}</p>
        </div>
        <Icon size={20} className={accent ? 'text-[#DC0000]/60' : 'text-[#333]'} />
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
        <h1 className="text-2xl font-bold text-white tracking-wide">Dashboard</h1>
        <div className="h-[2px] w-12 bg-[#DC0000] mt-2" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
            <span className="text-[#DC0000] ml-2">{data.todaysPickups.length}</span>
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
                  className="flex items-center justify-between bg-[#111] border border-[#1a1a1a] rounded-lg p-3 hover:border-[#DC0000]/30 transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.vehicleName}</p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {b.customerName} &middot; {formatTime(b.time)}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="text-[#333] group-hover:text-[#DC0000] transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Dropoffs */}
        <div>
          <h2 className="text-sm font-medium text-[#888] mb-3 tracking-[0.1em] uppercase">
            Today&apos;s Dropoffs
            <span className="text-[#DC0000] ml-2">{data.todaysDropoffs.length}</span>
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
                  className="flex items-center justify-between bg-[#111] border border-[#1a1a1a] rounded-lg p-3 hover:border-[#DC0000]/30 transition-all group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">{b.vehicleName}</p>
                    <p className="text-xs text-[#666] mt-0.5">
                      {b.customerName} &middot; {formatTime(b.time)}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="text-[#333] group-hover:text-[#DC0000] transition-colors" />
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
                className="flex items-center justify-between bg-[#111] border border-[#1a1a1a] rounded-lg p-3 hover:border-[#DC0000]/30 transition-all group"
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
                  <ArrowUpRight size={14} className="text-[#333] group-hover:text-[#DC0000] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
