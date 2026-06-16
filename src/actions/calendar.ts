'use server'

import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function getCalendarBookings(start: string, end: string) {
  await requireAuth()
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [
        {
          pickupDatetime: {
            gte: new Date(start),
            lte: new Date(end),
          },
        },
        {
          dropoffDatetime: {
            gte: new Date(start),
            lte: new Date(end),
          },
        },
        {
          AND: [
            { pickupDatetime: { lte: new Date(start) } },
            { dropoffDatetime: { gte: new Date(end) } },
          ],
        },
      ],
    },
    include: {
      customer: {
        select: { fullName: true },
      },
      vehicle: {
        select: { displayName: true },
      },
    },
    orderBy: { pickupDatetime: 'asc' },
  })

  return bookings.map((b) => ({
    id: b.id,
    title: `${b.vehicle.displayName} — ${b.customer.fullName} — ${b.status} — ${b.source.replace(/_/g, ' ')}`,
    start: b.pickupDatetime.toISOString(),
    end: b.dropoffDatetime.toISOString(),
    status: b.status,
  }))
}
