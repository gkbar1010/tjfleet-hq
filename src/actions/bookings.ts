'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth, requireRole } from '@/lib/auth'
import { BookingStatus, BookingSource, LeadBrand, VehicleStatus } from '@/generated/prisma/client'
import { revalidatePath } from 'next/cache'

// Transaction client type — Prisma interactive transaction provides a client
// with $queryRawUnsafe and model methods but not $connect/$disconnect
type TxClient = {
  $queryRawUnsafe: typeof prisma.$queryRawUnsafe
  booking: typeof prisma.booking
  vehicle: typeof prisma.vehicle
}

export async function getBookings(
  search?: string,
  status?: string,
  vehicleId?: string,
  customerId?: string,
  source?: string,
  dateFrom?: string,
  dateTo?: string
) {
  await requireAuth()
  const where: Record<string, unknown> = {}

  if (search) {
    const s = search.trim()
    where.OR = [
      { customer: { fullName: { contains: s, mode: 'insensitive' } } },
      { vehicle: { displayName: { contains: s, mode: 'insensitive' } } },
      { externalReservationId: { contains: s, mode: 'insensitive' } },
      { pickupLocation: { contains: s, mode: 'insensitive' } },
      { dropoffLocation: { contains: s, mode: 'insensitive' } },
    ]
  }

  if (status && status in BookingStatus) {
    where.status = status as BookingStatus
  }

  if (vehicleId) {
    where.vehicleId = vehicleId
  }

  if (customerId) {
    where.customerId = customerId
  }

  if (source && source in BookingSource) {
    where.source = source as BookingSource
  }

  if (dateFrom || dateTo) {
    const dateFilter: Record<string, Date> = {}
    if (dateFrom) dateFilter.gte = new Date(dateFrom)
    if (dateTo) dateFilter.lte = new Date(dateTo)
    where.pickupDatetime = dateFilter
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      customer: { select: { id: true, fullName: true } },
      vehicle: { select: { id: true, displayName: true } },
    },
    orderBy: { pickupDatetime: 'desc' },
  })

  return bookings
}

export async function getBooking(id: string) {
  await requireAuth()
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      vehicle: true,
      createdBy: { select: { id: true, fullName: true } },
      files: { orderBy: { createdAt: 'desc' } },
      bookingNotes: {
        include: { createdBy: { select: { id: true, fullName: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  return booking
}

/**
 * Check for overlapping bookings on the same vehicle.
 * Uses raw SQL with FOR UPDATE row lock to prevent race conditions.
 * MUST be called within a Prisma interactive transaction (tx).
 */
async function checkDoubleBooking(
  tx: TxClient,
  vehicleId: string,
  pickupDatetime: Date,
  dropoffDatetime: Date,
  excludeBookingId?: string
) {
  type ConflictRow = {
    id: string
    pickup_datetime: Date
    dropoff_datetime: Date
    status: string
    customer_name: string
  }

  // Use parameterized query — excludeBookingId is $4 (or a dummy value if not excluding)
  const excludeId = excludeBookingId || '00000000-0000-0000-0000-000000000000'

  const conflicts: ConflictRow[] = await tx.$queryRawUnsafe(
    `SELECT b.id, b.pickup_datetime, b.dropoff_datetime, b.status, c.full_name as customer_name
     FROM bookings b
     JOIN customers c ON c.id = b.customer_id
     WHERE b.vehicle_id = $1
       AND b.status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
       AND ($4::uuid = '00000000-0000-0000-0000-000000000000' OR b.id != $4)
       AND b.pickup_datetime < $2
       AND b.dropoff_datetime > $3
     FOR UPDATE OF b`,
    vehicleId,
    dropoffDatetime,
    pickupDatetime,
    excludeId
  )

  if (conflicts.length > 0) {
    return conflicts[0]
  }

  return null
}

export async function createBooking(formData: FormData) {
  const user = await requireRole('ADMIN', 'SECRETARY')

  const customerId = formData.get('customerId') as string
  const vehicleId = formData.get('vehicleId') as string
  const source = (formData.get('source') as string) || 'MANUAL_ENTRY'
  const leadBrand = (formData.get('leadBrand') as string) || null
  const pickupDatetime = formData.get('pickupDatetime') as string
  const dropoffDatetime = formData.get('dropoffDatetime') as string
  const pickupLocation = (formData.get('pickupLocation') as string) || null
  const dropoffLocation = (formData.get('dropoffLocation') as string) || null
  const externalReservationId = (formData.get('externalReservationId') as string) || null
  const assignedStaff = (formData.get('assignedStaff') as string) || null
  const notes = (formData.get('notes') as string) || null

  if (!customerId || !vehicleId || !pickupDatetime || !dropoffDatetime) {
    return { error: 'Customer, vehicle, pickup date, and dropoff date are required.' }
  }

  const pickup = new Date(pickupDatetime)
  const dropoff = new Date(dropoffDatetime)

  if (dropoff <= pickup) {
    return { error: 'Dropoff date must be after pickup date.' }
  }

  // Use a transaction with row-level locking to prevent race conditions
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check for double booking with FOR UPDATE lock
      const conflict = await checkDoubleBooking(tx, vehicleId, pickup, dropoff)

      if (conflict) {
        const conflictPickup = new Date(conflict.pickup_datetime).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
        })
        const conflictDropoff = new Date(conflict.dropoff_datetime).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
        })
        return {
          error: `Double-booking conflict: This vehicle is already booked by ${conflict.customer_name} from ${conflictPickup} to ${conflictDropoff} (Status: ${conflict.status}).`,
        }
      }

      const booking = await tx.booking.create({
        data: {
          customerId,
          vehicleId,
          source: source as BookingSource,
          leadBrand: leadBrand ? (leadBrand as LeadBrand) : null,
          pickupDatetime: pickup,
          dropoffDatetime: dropoff,
          pickupLocation: pickupLocation?.trim() || null,
          dropoffLocation: dropoffLocation?.trim() || null,
          externalReservationId: externalReservationId?.trim() || null,
          assignedStaff: assignedStaff?.trim() || null,
          notes: notes?.trim() || null,
          createdById: user.id,
        },
      })

      return { success: true, id: booking.id }
    })

    if (result.error) return result

    revalidatePath('/bookings')
    revalidatePath('/calendar')
    return result
  } catch (err) {
    console.error('Create booking error:', err)
    return { error: 'Failed to create booking. Please try again.' }
  }
}

export async function updateBooking(id: string, formData: FormData) {
  await requireRole('ADMIN', 'SECRETARY')

  const customerId = formData.get('customerId') as string
  const vehicleId = formData.get('vehicleId') as string
  const source = (formData.get('source') as string) || 'MANUAL_ENTRY'
  const leadBrand = (formData.get('leadBrand') as string) || null
  const pickupDatetime = formData.get('pickupDatetime') as string
  const dropoffDatetime = formData.get('dropoffDatetime') as string
  const pickupLocation = (formData.get('pickupLocation') as string) || null
  const dropoffLocation = (formData.get('dropoffLocation') as string) || null
  const externalReservationId = (formData.get('externalReservationId') as string) || null
  const assignedStaff = (formData.get('assignedStaff') as string) || null
  const notes = (formData.get('notes') as string) || null
  const mileageOut = formData.get('mileageOut') as string
  const mileageIn = formData.get('mileageIn') as string
  const fuelLevelOut = (formData.get('fuelLevelOut') as string) || null
  const fuelLevelIn = (formData.get('fuelLevelIn') as string) || null

  if (!customerId || !vehicleId || !pickupDatetime || !dropoffDatetime) {
    return { error: 'Customer, vehicle, pickup date, and dropoff date are required.' }
  }

  const pickup = new Date(pickupDatetime)
  const dropoff = new Date(dropoffDatetime)

  if (dropoff <= pickup) {
    return { error: 'Dropoff date must be after pickup date.' }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Check for double booking, excluding self
      const conflict = await checkDoubleBooking(tx, vehicleId, pickup, dropoff, id)

      if (conflict) {
        const conflictPickup = new Date(conflict.pickup_datetime).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
        })
        const conflictDropoff = new Date(conflict.dropoff_datetime).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit',
        })
        return {
          error: `Double-booking conflict: This vehicle is already booked by ${conflict.customer_name} from ${conflictPickup} to ${conflictDropoff} (Status: ${conflict.status}).`,
        }
      }

      await tx.booking.update({
        where: { id },
        data: {
          customerId,
          vehicleId,
          source: source as BookingSource,
          leadBrand: leadBrand ? (leadBrand as LeadBrand) : null,
          pickupDatetime: pickup,
          dropoffDatetime: dropoff,
          pickupLocation: pickupLocation?.trim() || null,
          dropoffLocation: dropoffLocation?.trim() || null,
          externalReservationId: externalReservationId?.trim() || null,
          assignedStaff: assignedStaff?.trim() || null,
          notes: notes?.trim() || null,
          mileageOut: mileageOut ? parseInt(mileageOut, 10) : null,
          mileageIn: mileageIn ? parseInt(mileageIn, 10) : null,
          fuelLevelOut: fuelLevelOut?.trim() || null,
          fuelLevelIn: fuelLevelIn?.trim() || null,
        },
      })

      return { success: true }
    })

    if (result.error) return result

    revalidatePath('/bookings')
    revalidatePath(`/bookings/${id}`)
    revalidatePath('/calendar')
    return result
  } catch (err) {
    console.error('Update booking error:', err)
    return { error: 'Failed to update booking. Please try again.' }
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await requireRole('ADMIN', 'SECRETARY')

  try {
    await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id },
        data: { status },
      })

      // Update vehicle status based on booking status
      if (status === 'ACTIVE') {
        await tx.vehicle.update({
          where: { id: booking.vehicleId },
          data: { status: 'BOOKED' as VehicleStatus },
        })
      } else if (status === 'COMPLETED') {
        await tx.vehicle.update({
          where: { id: booking.vehicleId },
          data: { status: 'NEEDS_CLEANING' as VehicleStatus },
        })
      } else if (status === 'CANCELLED') {
        // Only set to AVAILABLE if no other active/confirmed/pending bookings for this vehicle
        const otherActive = await tx.booking.count({
          where: {
            vehicleId: booking.vehicleId,
            id: { not: id },
            status: { in: ['ACTIVE', 'CONFIRMED', 'PENDING'] },
          },
        })
        if (otherActive === 0) {
          await tx.vehicle.update({
            where: { id: booking.vehicleId },
            data: { status: 'AVAILABLE' as VehicleStatus },
          })
        }
      }
    })

    revalidatePath('/bookings')
    revalidatePath(`/bookings/${id}`)
    revalidatePath('/fleet')
    revalidatePath('/calendar')
    return { success: true }
  } catch (err) {
    console.error('Update booking status error:', err)
    return { error: 'Failed to update booking status.' }
  }
}

export async function deleteBooking(id: string) {
  await requireRole('ADMIN')

  try {
    // Delete related notes and files first
    await prisma.note.deleteMany({ where: { bookingId: id } })
    await prisma.file.deleteMany({ where: { bookingId: id } })
    await prisma.booking.delete({ where: { id } })

    revalidatePath('/bookings')
    revalidatePath('/calendar')
    return { success: true }
  } catch (err) {
    console.error('Delete booking error:', err)
    return { error: 'Failed to delete booking.' }
  }
}

// Helper to get vehicles and customers for form dropdowns
export async function getBookingFormData() {
  await requireAuth()
  const [vehicles, customers] = await Promise.all([
    prisma.vehicle.findMany({
      select: { id: true, displayName: true, status: true },
      orderBy: { displayName: 'asc' },
    }),
    prisma.customer.findMany({
      select: { id: true, fullName: true },
      orderBy: { fullName: 'asc' },
    }),
  ])

  return { vehicles, customers }
}
