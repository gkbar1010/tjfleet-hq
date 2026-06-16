'use server'

import { prisma } from '@/lib/prisma'
import { TIMEZONE } from '@/lib/timezone'

function getEasternDayRange(): { start: Date; end: Date } {
  const now = new Date()
  // Get today's date in Eastern timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(now)
  const year = parseInt(parts.find(p => p.type === 'year')!.value)
  const month = parseInt(parts.find(p => p.type === 'month')!.value)
  const day = parseInt(parts.find(p => p.type === 'day')!.value)

  // Midnight Eastern = some hour UTC. Use Intl to find the offset.
  const midnightEastern = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00-05:00`)
  // Check if DST: create the date and see what offset we actually get
  const isDST = now.toLocaleString('en-US', { timeZone: TIMEZONE, timeZoneName: 'short' }).includes('EDT')
  const offset = isDST ? '-04:00' : '-05:00'

  const start = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00${offset}`)
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)

  return { start, end }
}

export async function getDashboardData() {
  const { start: todayStart, end: todayEnd } = getEasternDayRange()

  const [
    todaysPickups,
    todaysDropoffs,
    inquiryBookings,
    pendingBookings,
    confirmedBookings,
    activeBookings,
    availableCars,
    carsOut,
    inMaintenance,
    needsCleaning,
    recentInquiries,
  ] = await Promise.all([
    // Today's pickups: any non-completed/cancelled booking with pickup today
    prisma.booking.findMany({
      where: {
        pickupDatetime: { gte: todayStart, lt: todayEnd },
        status: { in: ['INQUIRY', 'PENDING', 'CONFIRMED', 'ACTIVE'] },
      },
      include: {
        customer: { select: { fullName: true } },
        vehicle: { select: { displayName: true } },
      },
      orderBy: { pickupDatetime: 'asc' },
    }),

    // Today's dropoffs: any active or confirmed booking with dropoff today
    prisma.booking.findMany({
      where: {
        dropoffDatetime: { gte: todayStart, lt: todayEnd },
        status: { in: ['CONFIRMED', 'ACTIVE'] },
      },
      include: {
        customer: { select: { fullName: true } },
        vehicle: { select: { displayName: true } },
      },
      orderBy: { dropoffDatetime: 'asc' },
    }),

    // Booking counts by status — ALL active statuses
    prisma.booking.count({ where: { status: 'INQUIRY' } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({ where: { status: 'CONFIRMED' } }),
    prisma.booking.count({ where: { status: 'ACTIVE' } }),

    // Vehicle counts by status
    prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
    prisma.vehicle.count({ where: { status: 'BOOKED' } }),
    prisma.vehicle.count({ where: { status: 'IN_MAINTENANCE' } }),
    prisma.vehicle.count({ where: { status: 'NEEDS_CLEANING' } }),

    // Recent inquiries
    prisma.booking.findMany({
      where: { status: 'INQUIRY' },
      include: {
        customer: { select: { fullName: true } },
        vehicle: { select: { displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  return {
    todaysPickups: todaysPickups.map((b) => ({
      id: b.id,
      customerName: b.customer.fullName,
      vehicleName: b.vehicle.displayName,
      time: b.pickupDatetime.toISOString(),
      status: b.status,
    })),
    todaysDropoffs: todaysDropoffs.map((b) => ({
      id: b.id,
      customerName: b.customer.fullName,
      vehicleName: b.vehicle.displayName,
      time: b.dropoffDatetime.toISOString(),
      status: b.status,
    })),
    inquiryBookings,
    pendingBookings,
    confirmedBookings,
    activeBookings,
    availableCars,
    carsOut,
    inMaintenance,
    needsCleaning,
    recentInquiries: recentInquiries.map((b) => ({
      id: b.id,
      customerName: b.customer.fullName,
      vehicleName: b.vehicle.displayName,
      createdAt: b.createdAt.toISOString(),
      source: b.source,
    })),
  }
}
