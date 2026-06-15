'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateBookingStatus, deleteBooking } from '@/actions/bookings'
import BookingForm from './BookingForm'

type BookingDetail = {
  id: string
  customerId: string
  vehicleId: string
  status: string
  source: string
  leadBrand: string | null
  pickupDatetime: Date | string
  dropoffDatetime: Date | string
  pickupLocation: string | null
  dropoffLocation: string | null
  externalReservationId: string | null
  assignedStaff: string | null
  mileageOut: number | null
  mileageIn: number | null
  fuelLevelOut: string | null
  fuelLevelIn: string | null
  notes: string | null
  createdAt: Date | string
  customer: { id: string; fullName: string; phone: string | null; email: string | null; instagram: string | null }
  vehicle: { id: string; displayName: string; status: string }
  createdBy: { id: string; fullName: string }
  files: Array<{ id: string; fileName: string | null; fileUrl: string; category: string; createdAt: Date | string }>
  bookingNotes: Array<{ id: string; body: string; createdAt: Date | string; createdBy: { id: string; fullName: string } }>
}

type Vehicle = { id: string; displayName: string; status: string }
type Customer = { id: string; fullName: string }

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: 'bg-neutral-600',
  PENDING: 'bg-yellow-600',
  CONFIRMED: 'bg-blue-600',
  ACTIVE: 'bg-green-600',
  COMPLETED: 'bg-neutral-700',
  CANCELLED: 'bg-red-600',
}

// Allowed forward transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  INQUIRY: ['PENDING'],
  PENDING: ['CONFIRMED'],
  CONFIRMED: ['ACTIVE'],
  ACTIVE: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
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

export default function BookingDetailClient({
  booking,
  vehicles,
  customers,
}: {
  booking: BookingDetail
  vehicles: Vehicle[]
  customers: Customer[]
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStatusChange(newStatus: string) {
    setStatusLoading(true)
    setError(null)
    const result = await updateBookingStatus(booking.id, newStatus as never)
    if (result.error) {
      setError(result.error)
    } else {
      router.refresh()
    }
    setStatusLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this booking? This cannot be undone.')) return
    const result = await deleteBooking(booking.id)
    if (result.error) {
      setError(result.error)
    } else {
      router.push('/bookings')
    }
  }

  const nextStatuses = STATUS_TRANSITIONS[booking.status] || []
  const canCancel = !['COMPLETED', 'CANCELLED'].includes(booking.status)

  if (editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Edit Booking</h1>
          <button
            onClick={() => setEditing(false)}
            className="border border-neutral-700 text-[#aaa] px-4 py-2 rounded font-medium hover:bg-neutral-800 transition-colors text-sm"
          >
            Cancel Edit
          </button>
        </div>
        <BookingForm vehicles={vehicles} customers={customers} booking={booking} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/bookings" className="text-[#888] hover:text-white transition-colors">
            &larr; Bookings
          </Link>
          <h1 className="text-2xl font-bold text-white">Booking Details</h1>
          <span
            className={`${STATUS_COLORS[booking.status] || 'bg-neutral-600'} text-white text-xs px-2 py-1 rounded`}
          >
            {booking.status}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="bg-[#E10600] text-white px-4 py-2 rounded font-medium hover:bg-[#FF2D2D] text-sm transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="border border-red-700 text-red-400 px-4 py-2 rounded font-medium hover:bg-red-900/30 text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {/* Status Actions */}
      {(nextStatuses.length > 0 || canCancel) && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 mb-6">
          <p className="text-[#888] text-sm mb-3">Update Status</p>
          <div className="flex gap-2 flex-wrap">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={statusLoading}
                className="bg-[#E10600] text-white px-4 py-2 rounded font-medium hover:bg-[#FF2D2D] text-sm disabled:opacity-50 transition-colors"
              >
                {statusLoading ? '...' : `Mark as ${s}`}
              </button>
            ))}
            {canCancel && (
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={statusLoading}
                className="border border-red-700 text-red-400 px-4 py-2 rounded font-medium hover:bg-red-900/30 text-sm disabled:opacity-50 transition-colors"
              >
                {statusLoading ? '...' : 'Cancel Booking'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Info */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4">
          <h2 className="text-white font-semibold mb-3">Booking Info</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888]">Source</span>
              <span className="text-white">{formatSource(booking.source)}</span>
            </div>
            {booking.leadBrand && (
              <div className="flex justify-between">
                <span className="text-[#888]">Lead Brand</span>
                <span className="text-white">{formatSource(booking.leadBrand)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888]">Pickup</span>
              <span className="text-white">{formatDate(booking.pickupDatetime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Dropoff</span>
              <span className="text-white">{formatDate(booking.dropoffDatetime)}</span>
            </div>
            {booking.pickupLocation && (
              <div className="flex justify-between">
                <span className="text-[#888]">Pickup Location</span>
                <span className="text-white">{booking.pickupLocation}</span>
              </div>
            )}
            {booking.dropoffLocation && (
              <div className="flex justify-between">
                <span className="text-[#888]">Dropoff Location</span>
                <span className="text-white">{booking.dropoffLocation}</span>
              </div>
            )}
            {booking.externalReservationId && (
              <div className="flex justify-between">
                <span className="text-[#888]">External ID</span>
                <span className="text-white">{booking.externalReservationId}</span>
              </div>
            )}
            {booking.assignedStaff && (
              <div className="flex justify-between">
                <span className="text-[#888]">Assigned Staff</span>
                <span className="text-white">{booking.assignedStaff}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888]">Created By</span>
              <span className="text-white">{booking.createdBy.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Created</span>
              <span className="text-[#aaa]">{formatDate(booking.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4">
          <h2 className="text-white font-semibold mb-3">Customer</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888]">Name</span>
              <Link href={`/customers/${booking.customer.id}`} className="text-white hover:underline">
                {booking.customer.fullName}
              </Link>
            </div>
            {booking.customer.phone && (
              <div className="flex justify-between">
                <span className="text-[#888]">Phone</span>
                <span className="text-white">{booking.customer.phone}</span>
              </div>
            )}
            {booking.customer.email && (
              <div className="flex justify-between">
                <span className="text-[#888]">Email</span>
                <span className="text-white">{booking.customer.email}</span>
              </div>
            )}
            {booking.customer.instagram && (
              <div className="flex justify-between">
                <span className="text-[#888]">Instagram</span>
                <span className="text-white">{booking.customer.instagram}</span>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4">
          <h2 className="text-white font-semibold mb-3">Vehicle</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888]">Vehicle</span>
              <Link href={`/fleet/${booking.vehicle.id}`} className="text-white hover:underline">
                {booking.vehicle.displayName}
              </Link>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Vehicle Status</span>
              <span className="text-white">{booking.vehicle.status}</span>
            </div>
          </div>
        </div>

        {/* Mileage & Fuel */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4">
          <h2 className="text-white font-semibold mb-3">Mileage & Fuel</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#888]">Mileage Out</span>
              <span className="text-white">{booking.mileageOut ?? '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Mileage In</span>
              <span className="text-white">{booking.mileageIn ?? '---'}</span>
            </div>
            {booking.mileageOut != null && booking.mileageIn != null && (
              <div className="flex justify-between">
                <span className="text-[#888]">Miles Driven</span>
                <span className="text-white">{booking.mileageIn - booking.mileageOut}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#888]">Fuel Out</span>
              <span className="text-white">{booking.fuelLevelOut || '---'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#888]">Fuel In</span>
              <span className="text-white">{booking.fuelLevelIn || '---'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {booking.notes && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 mt-6">
          <h2 className="text-white font-semibold mb-2">Booking Notes</h2>
          <p className="text-[#aaa] text-sm whitespace-pre-wrap">{booking.notes}</p>
        </div>
      )}

      {/* Activity Notes */}
      {booking.bookingNotes.length > 0 && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 mt-6">
          <h2 className="text-white font-semibold mb-3">Activity Notes</h2>
          <div className="space-y-3">
            {booking.bookingNotes.map((note) => (
              <div key={note.id} className="border-b border-[#1a1a1a] last:border-0 pb-3 last:pb-0">
                <p className="text-[#aaa] text-sm whitespace-pre-wrap">{note.body}</p>
                <p className="text-[#666] text-xs mt-1">
                  {note.createdBy.fullName} &middot; {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Files */}
      {booking.files.length > 0 && (
        <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 mt-6">
          <h2 className="text-white font-semibold mb-3">Files</h2>
          <div className="space-y-2">
            {booking.files.map((file) => (
              <a
                key={file.id}
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between border border-[#1a1a1a] rounded p-2 hover:bg-[#ffffff05] transition-colors"
              >
                <span className="text-white text-sm">{file.fileName || 'Unnamed file'}</span>
                <span className="text-[#666] text-xs">{file.category.replace(/_/g, ' ')}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
