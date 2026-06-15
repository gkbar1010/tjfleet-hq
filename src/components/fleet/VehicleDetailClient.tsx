'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { deleteVehicle } from '@/actions/fleet'
import VehicleForm from './VehicleForm'

type Booking = {
  id: string
  status: string
  pickupDatetime: string
  dropoffDatetime: string
  customer: {
    id: string
    fullName: string
  }
}

type VehicleFile = {
  id: string
  fileName: string | null
  fileUrl: string
  category: string
  createdAt: string
}

type Vehicle = {
  id: string
  displayName: string
  year: number | null
  make: string | null
  model: string | null
  trim: string | null
  exteriorColor: string | null
  interiorColor: string | null
  plate: string | null
  vin: string | null
  mileage: number | null
  status: string
  superiorListingStatus: string
  exoticDriveListingStatus: string
  turoListingStatus: string
  notes: string | null
  createdAt: string
  updatedAt: string
  bookings: Booking[]
  files: VehicleFile[]
}

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-900/50 text-green-400',
  BOOKED: 'bg-blue-900/50 text-blue-400',
  IN_MAINTENANCE: 'bg-yellow-900/50 text-yellow-400',
  NEEDS_CLEANING: 'bg-orange-900/50 text-orange-400',
  UNAVAILABLE: 'bg-red-900/50 text-red-400',
  SOLD_REMOVED: 'bg-neutral-700/50 text-neutral-400',
}

const LISTING_COLORS: Record<string, string> = {
  LISTED: 'bg-green-900/50 text-green-400',
  NOT_LISTED: 'bg-neutral-700/50 text-neutral-400',
  PAUSED: 'bg-yellow-900/50 text-yellow-400',
  UNKNOWN: 'bg-neutral-700/50 text-neutral-500',
}

const BOOKING_STATUS_COLORS: Record<string, string> = {
  INQUIRY: 'bg-neutral-700/50 text-neutral-400',
  PENDING: 'bg-yellow-900/50 text-yellow-400',
  CONFIRMED: 'bg-blue-900/50 text-blue-400',
  ACTIVE: 'bg-green-900/50 text-green-400',
  COMPLETED: 'bg-neutral-700/50 text-neutral-300',
  CANCELLED: 'bg-red-900/50 text-red-400',
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await deleteVehicle(vehicle.id)
      router.push('/fleet')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete vehicle')
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Edit {vehicle.displayName}</h1>
          <button
            onClick={() => setEditing(false)}
            className="bg-neutral-800 text-white px-4 py-2 rounded hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
        </div>
        <VehicleForm vehicle={vehicle} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{vehicle.displayName}</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing(true)}
            className="bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-900/50 text-red-400 px-4 py-2 rounded font-medium hover:bg-red-900/70 disabled:opacity-50 transition-colors"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Vehicle Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <InfoField label="Year" value={vehicle.year?.toString()} />
              <InfoField label="Make" value={vehicle.make} />
              <InfoField label="Model" value={vehicle.model} />
              <InfoField label="Trim" value={vehicle.trim} />
              <InfoField label="Exterior Color" value={vehicle.exteriorColor} />
              <InfoField label="Interior Color" value={vehicle.interiorColor} />
              <InfoField label="Plate" value={vehicle.plate} />
              <InfoField label="VIN" value={vehicle.vin} />
              <InfoField
                label="Mileage"
                value={vehicle.mileage != null ? vehicle.mileage.toLocaleString() : null}
              />
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Bookings</h2>
            {vehicle.bookings.length === 0 ? (
              <p className="text-neutral-500 text-sm">No bookings for this vehicle</p>
            ) : (
              <div className="space-y-3">
                {vehicle.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="block bg-neutral-800/50 border border-neutral-700 rounded-lg p-3 hover:border-neutral-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">
                        {booking.customer.fullName}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          BOOKING_STATUS_COLORS[booking.status] || ''
                        }`}
                      >
                        {formatStatus(booking.status)}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-400 mt-1">
                      {formatDateTime(booking.pickupDatetime)} &rarr;{' '}
                      {formatDateTime(booking.dropoffDatetime)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          {vehicle.notes && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Notes</h2>
              <p className="text-neutral-300 whitespace-pre-wrap">{vehicle.notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-neutral-400">Vehicle Status</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      STATUS_COLORS[vehicle.status] || ''
                    }`}
                  >
                    {formatStatus(vehicle.status)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-neutral-400">Superior</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      LISTING_COLORS[vehicle.superiorListingStatus] || ''
                    }`}
                  >
                    {formatStatus(vehicle.superiorListingStatus)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-neutral-400">Exotic Drive</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      LISTING_COLORS[vehicle.exoticDriveListingStatus] || ''
                    }`}
                  >
                    {formatStatus(vehicle.exoticDriveListingStatus)}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-neutral-400">Turo</span>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      LISTING_COLORS[vehicle.turoListingStatus] || ''
                    }`}
                  >
                    {formatStatus(vehicle.turoListingStatus)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Files</h2>
            {vehicle.files.length === 0 ? (
              <p className="text-neutral-500 text-sm">No files uploaded</p>
            ) : (
              <div className="space-y-2">
                {vehicle.files.map((file) => (
                  <a
                    key={file.id}
                    href={file.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-neutral-300 hover:text-white truncate transition-colors"
                  >
                    {file.fileName || 'Untitled file'}
                    <span className="text-neutral-500 ml-2 text-xs">
                      {formatDate(file.createdAt)}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-xs text-neutral-500 space-y-1">
            <div>Created: {formatDate(vehicle.createdAt)}</div>
            <div>Updated: {formatDate(vehicle.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <span className="text-sm text-neutral-400">{label}</span>
      <div className="text-white mt-0.5">{value || '-'}</div>
    </div>
  )
}
