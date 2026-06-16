'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createVehicle, updateVehicle } from '@/actions/fleet'

type VehicleData = {
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
  thumbnailUrl: string | null
  turoLink: string | null
  driveLink: string | null
  superiorLink: string | null
  exoticDriveLink: string | null
  notes: string | null
}

const VEHICLE_STATUSES = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'BOOKED', label: 'Booked' },
  { value: 'IN_MAINTENANCE', label: 'In Maintenance' },
  { value: 'NEEDS_CLEANING', label: 'Needs Cleaning' },
  { value: 'UNAVAILABLE', label: 'Unavailable' },
  { value: 'SOLD_REMOVED', label: 'Sold / Removed' },
]

const LISTING_STATUSES = [
  { value: 'UNKNOWN', label: 'Unknown' },
  { value: 'LISTED', label: 'Listed' },
  { value: 'NOT_LISTED', label: 'Not Listed' },
  { value: 'PAUSED', label: 'Paused' },
]

export default function VehicleForm({ vehicle }: { vehicle?: VehicleData }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isEditing = !!vehicle

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      const formData = new FormData(e.currentTarget)
      let result: { success?: boolean; id?: string; error?: string }

      if (isEditing) {
        result = await updateVehicle(vehicle.id, formData)
      } else {
        result = await createVehicle(formData)
      }

      if (result.error) {
        setError(result.error)
        setSaving(false)
        return
      }

      if (result.success && result.id) {
        router.push(`/fleet/${result.id}`)
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-white focus:outline-none focus:border-white'
  const labelClass = 'block text-sm text-[#888] mb-1'

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl">
      {error && (
        <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 space-y-6">
        <h2 className="text-lg font-semibold text-white">Vehicle Details</h2>

        <div>
          <label className={labelClass}>
            Display Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="displayName"
            defaultValue={vehicle?.displayName || ''}
            required
            className={inputClass}
            placeholder="e.g. Black Corvette C8"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Year</label>
            <input
              type="number"
              name="year"
              defaultValue={vehicle?.year ?? ''}
              min={1900}
              max={2100}
              className={inputClass}
              placeholder="2024"
            />
          </div>
          <div>
            <label className={labelClass}>Make</label>
            <input
              type="text"
              name="make"
              defaultValue={vehicle?.make || ''}
              className={inputClass}
              placeholder="Chevrolet"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Model</label>
            <input
              type="text"
              name="model"
              defaultValue={vehicle?.model || ''}
              className={inputClass}
              placeholder="Corvette"
            />
          </div>
          <div>
            <label className={labelClass}>Trim</label>
            <input
              type="text"
              name="trim"
              defaultValue={vehicle?.trim || ''}
              className={inputClass}
              placeholder="Stingray 3LT"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Exterior Color</label>
            <input
              type="text"
              name="exteriorColor"
              defaultValue={vehicle?.exteriorColor || ''}
              className={inputClass}
              placeholder="Black"
            />
          </div>
          <div>
            <label className={labelClass}>Interior Color</label>
            <input
              type="text"
              name="interiorColor"
              defaultValue={vehicle?.interiorColor || ''}
              className={inputClass}
              placeholder="Red"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Plate</label>
            <input
              type="text"
              name="plate"
              defaultValue={vehicle?.plate || ''}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>VIN</label>
            <input
              type="text"
              name="vin"
              defaultValue={vehicle?.vin || ''}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Mileage</label>
            <input
              type="number"
              name="mileage"
              defaultValue={vehicle?.mileage ?? ''}
              min={0}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 space-y-6 mt-6">
        <h2 className="text-lg font-semibold text-white">Status</h2>

        <div>
          <label className={labelClass}>Vehicle Status</label>
          <select
            name="status"
            defaultValue={vehicle?.status || 'AVAILABLE'}
            className={inputClass}
          >
            {VEHICLE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Superior Listing</label>
            <select
              name="superiorListingStatus"
              defaultValue={vehicle?.superiorListingStatus || 'UNKNOWN'}
              className={inputClass}
            >
              {LISTING_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Exotic Drive Listing</label>
            <select
              name="exoticDriveListingStatus"
              defaultValue={vehicle?.exoticDriveListingStatus || 'UNKNOWN'}
              className={inputClass}
            >
              {LISTING_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Turo Listing</label>
            <select
              name="turoListingStatus"
              defaultValue={vehicle?.turoListingStatus || 'UNKNOWN'}
              className={inputClass}
            >
              {LISTING_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 space-y-6 mt-6">
        <h2 className="text-lg font-semibold text-white">Photo & Links</h2>

        <div>
          <label className={labelClass}>Thumbnail Photo URL</label>
          <input
            type="url"
            name="thumbnailUrl"
            defaultValue={vehicle?.thumbnailUrl || ''}
            className={inputClass}
            placeholder="https://... (direct image link)"
          />
          <p className="text-xs text-[#666] mt-1">Paste a direct image URL. Shows on fleet list.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Google Drive Link</label>
            <input
              type="url"
              name="driveLink"
              defaultValue={vehicle?.driveLink || ''}
              className={inputClass}
              placeholder="https://drive.google.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>Turo Listing Link</label>
            <input
              type="url"
              name="turoLink"
              defaultValue={vehicle?.turoLink || ''}
              className={inputClass}
              placeholder="https://turo.com/..."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Superior Website Link</label>
            <input
              type="url"
              name="superiorLink"
              defaultValue={vehicle?.superiorLink || ''}
              className={inputClass}
              placeholder="https://superiormotorclub.com/..."
            />
          </div>
          <div>
            <label className={labelClass}>Exotic Drive Link</label>
            <input
              type="url"
              name="exoticDriveLink"
              defaultValue={vehicle?.exoticDriveLink || ''}
              className={inputClass}
              placeholder="https://exoticdrive.com/..."
            />
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#1a1a1a] rounded-lg p-6 mt-6">
        <label className={labelClass}>Notes</label>
        <textarea
          name="notes"
          defaultValue={vehicle?.notes || ''}
          rows={4}
          className={inputClass}
          placeholder="Any notes about this vehicle..."
        />
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button
          type="submit"
          disabled={saving}
          className="bg-[#E10600] text-white px-4 py-2 rounded font-medium hover:bg-[#FF2D2D] disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Vehicle'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-[#1a1a1a] text-white px-4 py-2 rounded hover:bg-[#222] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
