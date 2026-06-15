'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import Link from 'next/link'

type Booking = {
  id: string
  status: string
  source: string
  pickupDatetime: Date | string
  dropoffDatetime: Date | string
  pickupLocation: string | null
  dropoffLocation: string | null
  customer: { id: string; fullName: string }
  vehicle: { id: string; displayName: string }
}

type Vehicle = { id: string; displayName: string; status: string }
type Customer = { id: string; fullName: string }

const STATUS_OPTIONS = ['INQUIRY', 'PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED']
const SOURCE_OPTIONS = [
  'SUPERIOR_WEBSITE', 'EXOTIC_DRIVE_WEBSITE', 'TURO', 'INSTAGRAM',
  'PHONE_CALL', 'REFERRAL', 'REPEAT_CUSTOMER', 'MANUAL_ENTRY', 'OTHER',
]

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: 'bg-neutral-600',
  PENDING: 'bg-yellow-600',
  CONFIRMED: 'bg-blue-600',
  ACTIVE: 'bg-green-600',
  COMPLETED: 'bg-neutral-700',
  CANCELLED: 'bg-red-600',
}

function formatDate(d: Date | string) {
  const date = new Date(d)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatSource(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function BookingsPageClient({
  bookings,
  vehicles,
  customers,
  filters,
}: {
  bookings: Booking[]
  vehicles: Vehicle[]
  customers: Customer[]
  filters: {
    search?: string
    status?: string
    vehicleId?: string
    customerId?: string
    source?: string
    dateFrom?: string
    dateTo?: string
  }
}) {
  const router = useRouter()
  const [search, setSearch] = useState(filters.search || '')

  const applyFilters = useCallback(
    (overrides: Record<string, string | undefined> = {}) => {
      const params = new URLSearchParams()
      const merged = { ...filters, search, ...overrides }
      Object.entries(merged).forEach(([k, v]) => {
        if (v) params.set(k, v)
      })
      router.push(`/bookings?${params.toString()}`)
    },
    [filters, search, router]
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    applyFilters()
  }

  function handleFilterChange(key: string, value: string) {
    applyFilters({ [key]: value || undefined })
  }

  function clearFilters() {
    router.push('/bookings')
    setSearch('')
  }

  const hasFilters = filters.search || filters.status || filters.vehicleId || filters.customerId || filters.source || filters.dateFrom || filters.dateTo

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Bookings</h1>
        <Link
          href="/bookings/new"
          className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 transition-colors"
        >
          New Booking
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white w-56"
            />
            <button
              type="submit"
              className="bg-white text-black px-3 py-2 rounded text-sm font-medium hover:bg-neutral-200"
            >
              Search
            </button>
          </form>

          <select
            value={filters.status || ''}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={filters.vehicleId || ''}
            onChange={(e) => handleFilterChange('vehicleId', e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          >
            <option value="">All Vehicles</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.displayName}
              </option>
            ))}
          </select>

          <select
            value={filters.customerId || ''}
            onChange={(e) => handleFilterChange('customerId', e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          >
            <option value="">All Customers</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>

          <select
            value={filters.source || ''}
            onChange={(e) => handleFilterChange('source', e.target.value)}
            className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
          >
            <option value="">All Sources</option>
            {SOURCE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {formatSource(s)}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <label className="text-neutral-400 text-xs">From</label>
            <input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-neutral-400 text-xs">To</label>
            <input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="bg-neutral-900 border border-neutral-700 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white"
            />
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-neutral-400 hover:text-white text-sm underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {bookings.length === 0 ? (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-12 text-center">
          <p className="text-neutral-400">No bookings found.</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-white underline text-sm mt-2"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 text-left">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Pickup</th>
                <th className="px-4 py-3 font-medium">Dropoff</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                  className="border-b border-neutral-800 last:border-0 hover:bg-neutral-800/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-white">{booking.customer.fullName}</td>
                  <td className="px-4 py-3 text-white">{booking.vehicle.displayName}</td>
                  <td className="px-4 py-3 text-neutral-300">{formatDate(booking.pickupDatetime)}</td>
                  <td className="px-4 py-3 text-neutral-300">{formatDate(booking.dropoffDatetime)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`${STATUS_COLORS[booking.status] || 'bg-neutral-600'} text-white text-xs px-2 py-1 rounded`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">{formatSource(booking.source)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-neutral-500 text-xs mt-3">
        {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
