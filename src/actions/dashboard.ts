'use server'

import { prisma } from '@/lib/prisma'

export async function getDashboardData() {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart)
  todayEnd.setDate(todayEnd.getDate() + 1)

  const [
    todaysPickups,
    todaysDropoffs,
    pendingBookings,
    confirmedBookings,
    activeBookings,
    availableCars,
    carsOut,
    inMaintenance,
    needsCleaning,
    recentInquiries,
  ] = await Promise.all([
    // Today's pickups: bookings where pickup is today, status CONFIRMED or ACTIVE
    prisma.booking.findMany({
      where: {
        pickupDatetime: { gte: todayStart, lt: todayEnd },
        status: { in: ['CONFIRMED', 'ACTIVE'] },
      },
      include: {
        customer: { select: { fullName: true } },
        vehicle: { select: { displayName: true } },
      },
      orderBy: { pickupDatetime: 'asc' },
    }),

    // Today's dropoffs: bookings where dropoff is today, status ACTIVE
    prisma.booking.findMany({
      where: {
        dropoffDatetime: { gte: todayStart, lt: todayEnd },
        status: 'ACTIVE',
      },
      include: {
        customer: { select: { fullName: true } },
        vehicle: { select: { displayName: true } },
      },
      orderBy: { dropoffDatetime: 'asc' },
    }),

    // Booking counts by status
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
