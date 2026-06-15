'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import Link from 'next/link'

type Vehicle = {
  id: string
  displayName: string
  year: number | null
  make: string | null
  model: string | null
  trim: string | null
  mileage: number | null
  status: string
  superiorListingStatus: string
  exoticDriveListingStatus: string
  turoListingStatus: string
  thumbnailUrl: string | null
}

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
  { value: 'NEEDS_CLEANING', label: 'Needs Cleaning' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
  { value: 'SOLD_REMOVED', label: 'Sold / Removed' },
]

const LISTING_STATUS_OPTIONS = [
  { value: '', label: 'All Listings' },
  { value: 'LISTED', label: 'Listed' },
  { value: 'NOT_LISTED', label: 'Not Listed' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'UNKNOWN', label: 'Unknown' },
]

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-900/50 text-green-400',
  BOOKED: 'bg-blue-900/50 text-blue-400',
  IN_MAINTENANCE: 'bg-yellow-900/50 text-yellow-400',
  NEEDS_CLEANING: 'bg-orange-900/50 text-orange-400',
  UNAVAILABLE: 'bg-red-900/50 text-red-400',
  SOLD_REMOVED: 'bg-neutral-700/50 text-[#888]',
}

const LISTING_COLORS: Record<string, string> = {
  LISTED: 'bg-green-900/50 text-green-400',
  NOT_LISTED: 'bg-neutral-700/50 text-[#888]',
  PAUSED: 'bg-yellow-900/50 text-yellow-400',
  UNKNOWN: 'bg-neutral-700/50 text-[#666]',
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatListingStatus(s: string, v: string): string {
  if (v === 'UNKNOWN') return '-'
  return formatStatus(v)
}

export default function FleetPageClient({
  vehicles,
  initialSearch,
  initialStatus,
  initialListingStatus,
}: {
  vehicles: Vehicle[]
  initialSearch: string
  initialStatus: string
  initialListingStatus: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      router.push(`/fleet?${params.toString()}`)
    },
    [router, searchParams]
  )

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    updateFilters({ search })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Fleet Inventory</h1>
        <Link
          href="/fleet/new"
          className="bg-[#E10600] text-white px-4 py-2 rounded font-medium hover:bg-[#FF2D2D] transition-colors"
        >
          Add Vehicle
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by name, make, or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => updateFilters({ search })}
            className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-white"
          />
        </form>

        <select
          value={initialStatus}
          onChange={(e) => updateFilters({ status: e.target.value })}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={initialListingStatus}
          onChange={(e) => updateFilters({ listingStatus: e.target.value })}
          className="bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white"
        >
          {LISTING_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {vehicles.length === 0 ? (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-12 text-center">
          <p className="text-[#888] text-lg">No vehicles found</p>
          <p className="text-[#666] text-sm mt-1">
            {initialSearch || initialStatus || initialListingStatus
              ? 'Try adjusting your filters'
              : 'Add your first vehicle to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-neutral-900 rounded-lg overflow-hidden border border-[#1a1a1a]">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-800 text-left">
                <th className="w-16 px-4 py-3"></th>
                <th className="px-4 py-3 text-sm font-medium text-[#888]">Vehicle</th>
                <th className="px-4 py-3 text-sm font-medium text-[#888]">Year</th>
                <th className="px-4 py-3 text-sm font-medium text-[#888]">Status</th>
                <th className="px-4 py-3 text-sm font-medium text-[#888]">Superior</th>
                <th className="px-4 py-3 text-sm font-medium text-[#888]">Turo</th>
                <th className="px-4 py-3 text-sm font-medium text-[#888] text-right">Mileage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {vehicles.map((vehicle) => (
                <tr
                  key={vehicle.id}
                  onClick={() => router.push(`/fleet/${vehicle.id}`)}
                  className="hover:bg-[#ffffff05] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 w-16">
                    {vehicle.thumbnailUrl ? (
                      <img
                        src={vehicle.thumbnailUrl}
                        alt={vehicle.displayName}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-neutral-800 flex items-center justify-center text-neutral-600 text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white font-medium">{vehicle.displayName}</div>
                    {(vehicle.make || vehicle.model) && (
                      <div className="text-sm text-[#666]">
                        {[vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#aaa]">{vehicle.year || '-'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        STATUS_COLORS[vehicle.status] || 'bg-neutral-700 text-[#888]'
                      }`}
                    >
                      {formatStatus(vehicle.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        LISTING_COLORS[vehicle.superiorListingStatus] || ''
                      }`}
                    >
                      {formatListingStatus('Superior', vehicle.superiorListingStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        LISTING_COLORS[vehicle.turoListingStatus] || ''
                      }`}
                    >
                      {formatListingStatus('Turo', vehicle.turoListingStatus)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#aaa] text-right">
                    {vehicle.mileage != null ? vehicle.mileage.toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
