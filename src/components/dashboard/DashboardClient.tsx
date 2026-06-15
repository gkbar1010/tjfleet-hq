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
}: {
  label: string
  value: number
  icon: React.ElementType
  href?: string
}) {
  const content = (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value}</p>
          <p className="text-sm text-neutral-400 mt-1">{label}</p>
        </div>
        <Icon size={24} className="text-neutral-600" />
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
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard
          label="Pending Bookings"
          value={data.pendingBookings}
          icon={CalendarClock}
          href="/bookings?status=PENDING"
        />
        <StatCard
          label="Confirmed Bookings"
          value={data.confirmedBookings}
          icon={CalendarCheck}
          href="/bookings?status=CONFIRMED"
        />
        <StatCard
          label="Active Bookings"
          value={data.activeBookings}
          icon={Clock}
          href="/bookings?status=ACTIVE"
        />
        <StatCard
          label="Available Cars"
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
          label="In Maintenance"
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
          <h2 className="text-lg font-semibold text-white mb-3">
            Today&apos;s Pickups ({data.todaysPickups.length})
          </h2>
          {data.todaysPickups.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-500">
              No pickups scheduled for today
            </div>
          ) : (
            <div className="space-y-2">
              {data.todaysPickups.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {b.vehicleName}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {b.customerName} &middot; {formatTime(b.time)}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-neutral-600 group-hover:text-neutral-400 transition-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Today's Dropoffs */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-3">
            Today&apos;s Dropoffs ({data.todaysDropoffs.length})
          </h2>
          {data.todaysDropoffs.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-500">
              No dropoffs scheduled for today
            </div>
          ) : (
            <div className="space-y-2">
              {data.todaysDropoffs.map((b) => (
                <Link
                  key={b.id}
                  href={`/bookings/${b.id}`}
                  className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-white">
                      {b.vehicleName}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {b.customerName} &middot; {formatTime(b.time)}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-neutral-600 group-hover:text-neutral-400 transition-colors"
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Inquiries */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3">
          Recent Inquiries
        </h2>
        {data.recentInquiries.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 text-sm text-neutral-500">
            No recent inquiries
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentInquiries.map((inq) => (
              <Link
                key={inq.id}
                href={`/bookings/${inq.id}`}
                className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare size={16} className="text-neutral-600" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {inq.vehicleName}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {inq.customerName} &middot;{' '}
                      {formatSourceLabel(inq.source)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-neutral-500">
                    {new Date(inq.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <ArrowUpRight
                    size={16}
                    className="text-neutral-600 group-hover:text-neutral-400 transition-colors"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
