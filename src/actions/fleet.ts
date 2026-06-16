'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { VehicleStatus, ListingStatus, UserRole } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'

export async function getVehicles(
  search?: string,
  status?: string,
  listingStatus?: string
) {
  await requireAuth()
  const conditions: Record<string, unknown>[] = []

  if (search) {
    conditions.push({
      OR: [
        { displayName: { contains: search, mode: 'insensitive' } },
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
      ],
    })
  }

  if (status && Object.values(VehicleStatus).includes(status as VehicleStatus)) {
    conditions.push({ status: status as VehicleStatus })
  }

  if (listingStatus && Object.values(ListingStatus).includes(listingStatus as ListingStatus)) {
    conditions.push({
      OR: [
        { superiorListingStatus: listingStatus as ListingStatus },
        { exoticDriveListingStatus: listingStatus as ListingStatus },
        { turoListingStatus: listingStatus as ListingStatus },
      ],
    })
  }

  const where = conditions.length > 0 ? { AND: conditions } : {}

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })

  return vehicles
}

export async function getVehicle(id: string) {
  await requireAuth()
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          customer: true,
        },
        orderBy: { pickupDatetime: 'desc' },
        take: 10,
      },
      files: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return vehicle
}

export async function createVehicle(formData: FormData) {
  await requireRole(UserRole.ADMIN, UserRole.SECRETARY)

  try {
    const data = extractVehicleData(formData)

    const vehicle = await prisma.vehicle.create({ data })

    revalidatePath('/fleet')
    return { success: true, id: vehicle.id }
  } catch (err) {
    if (err instanceof Error && err.message === 'Display name is required') {
      return { error: err.message }
    }
    console.error('Create vehicle error:', err)
    return { error: 'Failed to create vehicle. Please try again.' }
  }
}

export async function updateVehicle(id: string, formData: FormData) {
  await requireRole(UserRole.ADMIN, UserRole.SECRETARY)

  try {
    const data = extractVehicleData(formData)

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data,
    })

    revalidatePath('/fleet')
    revalidatePath(`/fleet/${id}`)
    return { success: true, id: vehicle.id }
  } catch (err) {
    if (err instanceof Error && err.message === 'Display name is required') {
      return { error: err.message }
    }
    console.error('Update vehicle error:', err)
    return { error: 'Failed to update vehicle. Please try again.' }
  }
}

export async function deleteVehicle(id: string) {
  await requireRole(UserRole.ADMIN)

  try {
    const bookingCount = await prisma.booking.count({
      where: { vehicleId: id },
    })

    if (bookingCount > 0) {
      return { error: `Cannot delete this vehicle because it has ${bookingCount} booking(s). Remove or reassign them first.` }
    }

    await prisma.vehicle.delete({ where: { id } })

    revalidatePath('/fleet')
    return { success: true }
  } catch (err) {
    console.error('Delete vehicle error:', err)
    return { error: 'Failed to delete vehicle. Please try again.' }
  }
}

function extractVehicleData(formData: FormData) {
  const displayName = formData.get('displayName') as string
  const year = formData.get('year') as string
  const make = formData.get('make') as string
  const model = formData.get('model') as string
  const trim = formData.get('trim') as string
  const exteriorColor = formData.get('exteriorColor') as string
  const interiorColor = formData.get('interiorColor') as string
  const plate = formData.get('plate') as string
  const vin = formData.get('vin') as string
  const mileage = formData.get('mileage') as string
  const status = formData.get('status') as string
  const superiorListingStatus = formData.get('superiorListingStatus') as string
  const exoticDriveListingStatus = formData.get('exoticDriveListingStatus') as string
  const turoListingStatus = formData.get('turoListingStatus') as string
  const notes = formData.get('notes') as string
  const thumbnailUrl = formData.get('thumbnailUrl') as string
  const turoLink = formData.get('turoLink') as string
  const driveLink = formData.get('driveLink') as string
  const superiorLink = formData.get('superiorLink') as string
  const exoticDriveLink = formData.get('exoticDriveLink') as string

  if (!displayName || !displayName.trim()) {
    throw new Error('Display name is required')
  }

  return {
    displayName: displayName.trim(),
    year: year ? parseInt(year, 10) : null,
    make: make?.trim() || null,
    model: model?.trim() || null,
    trim: trim?.trim() || null,
    exteriorColor: exteriorColor?.trim() || null,
    interiorColor: interiorColor?.trim() || null,
    plate: plate?.trim() || null,
    vin: vin?.trim() || null,
    mileage: mileage ? parseInt(mileage, 10) : null,
    status: (status as VehicleStatus) || VehicleStatus.AVAILABLE,
    superiorListingStatus: (superiorListingStatus as ListingStatus) || ListingStatus.UNKNOWN,
    exoticDriveListingStatus: (exoticDriveListingStatus as ListingStatus) || ListingStatus.UNKNOWN,
    turoListingStatus: (turoListingStatus as ListingStatus) || ListingStatus.UNKNOWN,
    thumbnailUrl: thumbnailUrl?.trim() || null,
    turoLink: turoLink?.trim() || null,
    driveLink: driveLink?.trim() || null,
    superiorLink: superiorLink?.trim() || null,
    exoticDriveLink: exoticDriveLink?.trim() || null,
    notes: notes?.trim() || null,
  }
}
