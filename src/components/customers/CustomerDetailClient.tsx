'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Phone,
  Mail,
  AtSign,
  FileText,
  Shield,
  Calendar,
  Car,
} from 'lucide-react'
import { deleteCustomer } from '@/actions/customers'

type BookingWithVehicle = {
  id: string
  status: string
  pickupDatetime: Date | string
  dropoffDatetime: Date | string
  source: string
  vehicle: {
    id: string
    displayName: string
  }
}

type CustomerFile = {
  id: string
  fileUrl: string
  fileName: string | null
  category: string
  createdAt: Date | string
}

type CustomerDetail = {
  id: string
  fullName: string
  phone: string | null
  email: string | null
  instagram: string | null
  notes: string | null
  tags: string[]
  licenseFileUrl: string | null
  insuranceFileUrl: string | null
  createdAt: Date | string
  bookings: BookingWithVehicle[]
  files: CustomerFile[]
}

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: 'bg-blue-900/40 text-blue-300',
  PENDING: 'bg-yellow-900/40 text-yellow-300',
  CONFIRMED: 'bg-emerald-900/40 text-emerald-300',
  ACTIVE: 'bg-green-900/40 text-green-300',
  COMPLETED: 'bg-neutral-800 text-neutral-300',
  CANCELLED: 'bg-red-900/40 text-red-300',
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function CustomerDetailClient({
  customer,
}: {
  customer: CustomerDetail
}) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete ${customer.fullName}? This cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      await deleteCustomer(customer.id)
      router.push('/customers')
      router.refresh()
    } catch {
      alert('Failed to delete customer. They may have associated bookings.')
      setDeleting(false)
    }
  }

  const licenseFiles = customer.files.filter(
    (f) => f.category === 'CUSTOMER_LICENSE'
  )
  const insuranceFiles = customer.files.filter(
    (f) => f.category === 'CUSTOMER_INSURANCE'
  )

  return (
    <div>
      <Link
        href="/customers"
        className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors mb-4"
      >
        <ArrowLeft size={14} />
        Back to customers
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{customer.fullName}</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Customer since {formatDate(customer.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/customers/${customer.id}/edit`}
            className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded font-medium hover:bg-neutral-200 transition-colors text-sm"
          >
            <Pencil size={14} />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-2 bg-neutral-900 border border-neutral-700 text-red-400 px-4 py-2 rounded font-medium hover:bg-neutral-800 transition-colors text-sm disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Contact info */}
        <div className="space-y-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
            <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              Contact
            </h2>
            <div className="space-y-3">
              {customer.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={16} className="text-neutral-500 flex-shrink-0" />
                  <a href={`tel:${customer.phone}`} className="text-white hover:underline">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail size={16} className="text-neutral-500 flex-shrink-0" />
                  <a href={`mailto:${customer.email}`} className="text-white hover:underline truncate">
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.instagram && (
                <div className="flex items-center gap-3 text-sm">
                  <AtSign size={16} className="text-neutral-500 flex-shrink-0" />
                  <a
                    href={`https://instagram.com/${customer.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline"
                  >
                    @{customer.instagram.replace('@', '')}
                  </a>
                </div>
              )}
              {!customer.phone && !customer.email && !customer.instagram && (
                <p className="text-sm text-neutral-600">No contact info</p>
              )}
            </div>
          </div>

          {customer.tags.length > 0 && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Tags
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {customer.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {customer.notes && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Notes
              </h2>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}

          {/* Documents */}
          {(customer.licenseFileUrl || customer.insuranceFileUrl || licenseFiles.length > 0 || insuranceFiles.length > 0) && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Documents
              </h2>
              <div className="space-y-2">
                {customer.licenseFileUrl && (
                  <a
                    href={customer.licenseFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:underline"
                  >
                    <FileText size={14} className="text-neutral-500" />
                    Driver&apos;s License
                  </a>
                )}
                {customer.insuranceFileUrl && (
                  <a
                    href={customer.insuranceFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:underline"
                  >
                    <Shield size={14} className="text-neutral-500" />
                    Insurance
                  </a>
                )}
                {licenseFiles.map((f) => (
                  <a
                    key={f.id}
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:underline"
                  >
                    <FileText size={14} className="text-neutral-500" />
                    {f.fileName ?? 'License File'}
                  </a>
                ))}
                {insuranceFiles.map((f) => (
                  <a
                    key={f.id}
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-white hover:underline"
                  >
                    <Shield size={14} className="text-neutral-500" />
                    {f.fileName ?? 'Insurance File'}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column - Rental history */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
            <div className="px-4 py-3 border-b border-neutral-800">
              <h2 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider">
                Rental History ({customer.bookings.length})
              </h2>
            </div>

            {customer.bookings.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar size={32} className="mx-auto text-neutral-600 mb-2" />
                <p className="text-sm text-neutral-500">No bookings yet</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {customer.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Car size={18} className="text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">
                        {booking.vehicle.displayName}
                      </div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        {formatDateTime(booking.pickupDatetime)} &mdash;{' '}
                        {formatDateTime(booking.dropoffDatetime)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500 capitalize">
                        {booking.source.replace(/_/g, ' ').toLowerCase()}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          STATUS_COLORS[booking.status] ?? 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
