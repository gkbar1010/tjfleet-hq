import { getBooking, getBookingFormData } from '@/actions/bookings'
import { notFound } from 'next/navigation'
import BookingDetailClient from '@/components/bookings/BookingDetailClient'

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [booking, { vehicles, customers }] = await Promise.all([
    getBooking(id),
    getBookingFormData(),
  ])

  if (!booking) {
    notFound()
  }

  return (
    <BookingDetailClient
      booking={booking}
      vehicles={vehicles}
      customers={customers}
    />
  )
}
