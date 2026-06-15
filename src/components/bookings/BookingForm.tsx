'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking, updateBooking } from '@/actions/bookings'

type Vehicle = { id: string; displayName: string; status: string }
type Customer = { id: string; fullName: string }

const SOURCE_OPTIONS = [
  { value: 'SUPERIOR_WEBSITE', label: 'Superior Website' },
  { value: 'EXOTIC_DRIVE_WEBSITE', label: 'Exotic Drive Website' },
  { value: 'TURO', label: 'Turo' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'PHONE_CALL', label: 'Phone Call' },
  { value: 'REFERRAL', label: 'Referral' },
  { value: 'REPEAT_CUSTOMER', label: 'Repeat Customer' },
  { value: 'MANUAL_ENTRY', label: 'Manual Entry' },
  { value: 'OTHER', label: 'Other' },
]

const LEAD_BRAND_OPTIONS = [
  { value: '', label: 'Select brand...' },
  { value: 'TJ', label: 'TJ' },
  { value: 'SUPERIOR_MOTOR_CLUB', label: 'Superior Motor Club' },
  { value: 'EXOTIC_DRIVE', label: 'Exotic Drive' },
  { value: 'TURO', label: 'Turo' },
]

type BookingData = {
  id: string
  customerId: string
  vehicleId: string
  source: string
  leadBrand: string | null
  pickupDatetime: Date | string
  dropoffDatetime: Date | string
  pickupLocation: string | null
  dropoffLocation: string | null
  externalReservationId: string | null
  assignedStaff: string | null
  notes: string | null
  mileageOut: number | null
  mileageIn: number | null
  fuelLevelOut: string | null
  fuelLevelIn: string | null
}

function toDatetimeLocal(d: Date | string | null) {
  if (!d) return ''
  const date = new Date(d)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export default function BookingForm({
  vehicles,
  customers,
  booking,
}: {
  vehicles: Vehicle[]
  customers: Customer[]
  booking?: BookingData
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const isEdit = !!booking

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      let result: { success?: boolean; id?: string; error?: string }

      if (isEdit) {
        result = await updateBooking(booking.id, formData)
      } else {
        result = await createBooking(formData)
      }

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      if (isEdit) {
        router.push(`/bookings/${booking.id}`)
      } else if (result.id) {
        router.push(`/bookings/${result.id}`)
      } else {
        router.push('/bookings')
      }
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  const inputClass =
    'bg-[#111] border border-[#222] rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white w-full'
  const labelClass = 'block text-sm text-[#888] mb-1'

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200 text-sm font-medium">Booking Error</p>
          <p className="text-red-300 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Customer <span className="text-red-400">*</span>
            </label>
            <select
              name="customerId"
              required
              defaultValue={booking?.customerId || ''}
              className={inputClass}
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>
              Vehicle <span className="text-red-400">*</span>
            </label>
            <select
              name="vehicleId"
              required
              defaultValue={booking?.vehicleId || ''}
              className={inputClass}
            >
              <option value="">Select vehicle...</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.displayName} ({v.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Source</label>
            <select
              name="source"
              defaultValue={booking?.source || 'MANUAL_ENTRY'}
              className={inputClass}
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Lead Brand</label>
            <select
              name="leadBrand"
              defaultValue={booking?.leadBrand || ''}
              className={inputClass}
            >
              {LEAD_BRAND_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>
              Pickup Date/Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              name="pickupDatetime"
              required
              defaultValue={toDatetimeLocal(booking?.pickupDatetime || null)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              Dropoff Date/Time <span className="text-red-400">*</span>
            </label>
            <input
              type="datetime-local"
              name="dropoffDatetime"
              required
              defaultValue={toDatetimeLocal(booking?.dropoffDatetime || null)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Pickup Location</label>
            <input
              type="text"
              name="pickupLocation"
              defaultValue={booking?.pickupLocation || ''}
              placeholder="e.g. Office, LAX"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Dropoff Location</label>
            <input
              type="text"
              name="dropoffLocation"
              defaultValue={booking?.dropoffLocation || ''}
              placeholder="e.g. Office, LAX"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>External Reservation ID</label>
            <input
              type="text"
              name="externalReservationId"
              defaultValue={booking?.externalReservationId || ''}
              placeholder="e.g. Turo #12345"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Assigned Staff</label>
            <input
              type="text"
              name="assignedStaff"
              defaultValue={booking?.assignedStaff || ''}
              className={inputClass}
            />
          </div>
        </div>

        {isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Mileage Out</label>
                <input
                  type="number"
                  name="mileageOut"
                  defaultValue={booking?.mileageOut ?? ''}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Mileage In</label>
                <input
                  type="number"
                  name="mileageIn"
                  defaultValue={booking?.mileageIn ?? ''}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Fuel Out</label>
                <input
                  type="text"
                  name="fuelLevelOut"
                  defaultValue={booking?.fuelLevelOut || ''}
                  placeholder="e.g. Full, 3/4"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Fuel In</label>
                <input
                  type="text"
                  name="fuelLevelIn"
                  defaultValue={booking?.fuelLevelIn || ''}
                  placeholder="e.g. Full, 3/4"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={booking?.notes || ''}
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-[#E10600] text-white px-4 py-2 rounded font-medium hover:bg-[#FF2D2D] disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving...' : isEdit ? 'Update Booking' : 'Create Booking'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="border border-neutral-700 text-[#aaa] px-4 py-2 rounded font-medium hover:bg-neutral-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
