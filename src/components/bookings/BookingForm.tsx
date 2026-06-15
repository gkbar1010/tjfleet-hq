'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBooking, updateBooking } from '@/actions/bookings'
import { createCustomer } from '@/actions/customers'
import { UserPlus, X, Search } from 'lucide-react'

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

const TIME_OPTIONS = (() => {
  const times: { value: string; label: string }[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h % 12 || 12
      const ampm = h < 12 ? 'AM' : 'PM'
      const label = `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
      const value = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      times.push({ value, label })
    }
  }
  return times
})()

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

function splitDatetime(d: Date | string | null): { date: string; time: string } {
  if (!d) return { date: '', time: '10:00' }
  const date = new Date(d)
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60 * 1000)
  return {
    date: local.toISOString().slice(0, 10),
    time: local.toISOString().slice(11, 16),
  }
}

function QuickAddCustomerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: (customer: { id: string; fullName: string }) => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await createCustomer(formData)

    if (result.error) {
      setError(result.error)
      setSaving(false)
      return
    }

    if (result.success && result.id) {
      onCreated({ id: result.id, fullName: formData.get('fullName') as string })
    }
  }

  const inputClass = 'w-full bg-[#0e0e0e] border border-[#222] rounded-lg px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-[#E10600] focus:shadow-[0_0_8px_rgba(225,6,0,0.12)] transition-all'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Italian stripe top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl bg-gradient-to-r from-[#008C45] via-[#F2F2F2] to-[#E10600]" />

        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-base">Quick Add Customer</h3>
          <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-[#E10600]/10 border border-[#E10600]/30 text-[#ff6666] px-3 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs text-[#777] mb-1.5 font-medium">Full Name *</label>
            <input ref={nameRef} type="text" name="fullName" required className={inputClass} placeholder="John Smith" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#777] mb-1.5 font-medium">Phone</label>
              <input type="text" name="phone" className={inputClass} placeholder="(555) 123-4567" />
            </div>
            <div>
              <label className="block text-xs text-[#777] mb-1.5 font-medium">Email</label>
              <input type="email" name="email" className={inputClass} placeholder="john@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-[#777] mb-1.5 font-medium">Instagram</label>
            <input type="text" name="instagram" className={inputClass} placeholder="@handle" />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#E10600] text-white py-2.5 rounded-lg font-semibold hover:bg-[#FF2D2D] hover:shadow-[0_0_15px_rgba(225,6,0,0.25)] disabled:opacity-50 transition-all text-sm"
            >
              {saving ? 'Adding...' : 'Add Customer'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 border border-[#222] text-[#888] rounded-lg hover:bg-[#1a1a1a] transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BookingForm({
  vehicles,
  customers: initialCustomers,
  booking,
}: {
  vehicles: Vehicle[]
  customers: Customer[]
  booking?: BookingData
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showAddCustomer, setShowAddCustomer] = useState(false)
  const [customers, setCustomers] = useState(initialCustomers)
  const [selectedCustomerId, setSelectedCustomerId] = useState(booking?.customerId || '')
  const [customerSearch, setCustomerSearch] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerDropdownRef = useRef<HTMLDivElement>(null)

  const isEdit = !!booking
  const pickupInit = splitDatetime(booking?.pickupDatetime || null)
  const dropoffInit = splitDatetime(booking?.dropoffDatetime || null)

  const [pickupDate, setPickupDate] = useState(pickupInit.date)
  const [pickupTime, setPickupTime] = useState(pickupInit.time)
  const [dropoffDate, setDropoffDate] = useState(dropoffInit.date)
  const [dropoffTime, setDropoffTime] = useState(dropoffInit.time)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const filteredCustomers = customerSearch
    ? customers.filter(c => c.fullName.toLowerCase().includes(customerSearch.toLowerCase()))
    : customers

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      // Combine date + time into datetime-local format
      formData.set('pickupDatetime', `${pickupDate}T${pickupTime}`)
      formData.set('dropoffDatetime', `${dropoffDate}T${dropoffTime}`)
      formData.set('customerId', selectedCustomerId)

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
    } catch {
      setError('An unexpected error occurred.')
      setLoading(false)
    }
  }

  function handleCustomerCreated(customer: { id: string; fullName: string }) {
    setCustomers(prev => [...prev, customer].sort((a, b) => a.fullName.localeCompare(b.fullName)))
    setSelectedCustomerId(customer.id)
    setShowAddCustomer(false)
    setCustomerSearch('')
    setShowCustomerDropdown(false)
  }

  const inputClass = 'w-full bg-[#0e0e0e] border border-[#1e1e1e] rounded-lg px-3.5 py-2.5 text-white text-[15px] focus:outline-none focus:border-[#E10600] focus:shadow-[0_0_8px_rgba(225,6,0,0.12)] transition-all placeholder-[#333]'
  const labelClass = 'block text-xs text-[#777] mb-1.5 font-semibold tracking-wide uppercase'

  return (
    <>
      {showAddCustomer && (
        <QuickAddCustomerModal
          onClose={() => setShowAddCustomer(false)}
          onCreated={handleCustomerCreated}
        />
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        {error && (
          <div className="bg-[#E10600]/10 border border-[#E10600]/30 rounded-xl p-4 mb-6">
            <p className="text-[#ff8888] text-sm font-semibold">Booking Conflict</p>
            <p className="text-[#ff6666] text-sm mt-1">{error}</p>
          </div>
        )}

        {/* Customer & Vehicle Section */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 space-y-5">
          <div className="grid grid-cols-2 gap-5">
            {/* Customer selector with search + add */}
            <div>
              <label className={labelClass}>
                Customer <span className="text-[#E10600]">*</span>
              </label>
              <div className="relative" ref={customerDropdownRef}>
                <div
                  className={`${inputClass} cursor-pointer flex items-center justify-between`}
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}
                >
                  <span className={selectedCustomer ? 'text-white' : 'text-[#555]'}>
                    {selectedCustomer ? selectedCustomer.fullName : 'Select customer...'}
                  </span>
                  <Search size={14} className="text-[#444]" />
                </div>
                {/* Hidden input for form submission */}
                <input type="hidden" name="customerId" value={selectedCustomerId} />

                {showCustomerDropdown && (
                  <div className="absolute z-40 top-full left-0 right-0 mt-1 bg-[#111] border border-[#222] rounded-xl shadow-2xl overflow-hidden max-h-72">
                    {/* Search input */}
                    <div className="p-2 border-b border-[#1a1a1a]">
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#E10600] placeholder-[#444]"
                        autoFocus
                      />
                    </div>

                    {/* Add new customer button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomerDropdown(false)
                        setShowAddCustomer(true)
                      }}
                      className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 text-[#E10600] hover:bg-[#E10600]/10 transition-colors border-b border-[#1a1a1a] font-semibold"
                    >
                      <UserPlus size={14} />
                      Add New Customer
                    </button>

                    {/* Customer list */}
                    <div className="overflow-y-auto max-h-48">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-3 py-3 text-sm text-[#555]">No customers found</div>
                      ) : (
                        filteredCustomers.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedCustomerId(c.id)
                              setShowCustomerDropdown(false)
                              setCustomerSearch('')
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[#1a1a1a] transition-colors ${
                              c.id === selectedCustomerId ? 'text-[#E10600] bg-[#E10600]/5' : 'text-white'
                            }`}
                          >
                            {c.fullName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                Vehicle <span className="text-[#E10600]">*</span>
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
                    {v.displayName} ({v.status.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Source & Lead Brand */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Source</label>
              <select
                name="source"
                defaultValue={booking?.source || 'MANUAL_ENTRY'}
                className={inputClass}
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
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
                  <option key={b.value} value={b.value}>{b.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 space-y-5 mt-4">
          <h3 className="text-xs text-[#555] tracking-[0.15em] uppercase font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            Schedule
          </h3>

          {/* Pickup */}
          <div>
            <label className={labelClass}>
              Pickup <span className="text-[#E10600]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => {
                  setPickupDate(e.target.value)
                  if (!dropoffDate || e.target.value > dropoffDate) {
                    setDropoffDate(e.target.value)
                  }
                }}
                required
                className={inputClass}
              />
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className={inputClass}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dropoff */}
          <div>
            <label className={labelClass}>
              Dropoff <span className="text-[#E10600]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={dropoffDate}
                onChange={(e) => setDropoffDate(e.target.value)}
                min={pickupDate}
                required
                className={inputClass}
              />
              <select
                value={dropoffTime}
                onChange={(e) => setDropoffTime(e.target.value)}
                className={inputClass}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Locations */}
          <div className="grid grid-cols-2 gap-5">
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
        </div>

        {/* Details Section */}
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-5 space-y-5 mt-4">
          <h3 className="text-xs text-[#555] tracking-[0.15em] uppercase font-bold" style={{ fontFamily: 'Orbitron, monospace' }}>
            Details
          </h3>

          <div className="grid grid-cols-2 gap-5">
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
            <>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className={labelClass}>Mileage Out</label>
                  <input type="number" name="mileageOut" defaultValue={booking?.mileageOut ?? ''} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Mileage In</label>
                  <input type="number" name="mileageIn" defaultValue={booking?.mileageIn ?? ''} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fuel Out</label>
                  <input type="text" name="fuelLevelOut" defaultValue={booking?.fuelLevelOut || ''} placeholder="Full" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Fuel In</label>
                  <input type="text" name="fuelLevelIn" defaultValue={booking?.fuelLevelIn || ''} placeholder="Full" className={inputClass} />
                </div>
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={booking?.notes || ''}
              placeholder="Internal notes about this booking..."
              className={inputClass}
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 mt-5">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#E10600] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-[#FF2D2D] hover:shadow-[0_0_20px_rgba(225,6,0,0.25)] disabled:opacity-50 transition-all text-sm tracking-wide"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Booking' : 'Create Booking'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-[#222] text-[#888] px-5 py-2.5 rounded-lg font-medium hover:bg-[#1a1a1a] transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  )
}
