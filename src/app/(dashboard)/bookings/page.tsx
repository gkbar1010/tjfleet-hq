import { getBookings, getBookingFormData } from '@/actions/bookings'
import BookingsPageClient from '@/components/bookings/BookingsPageClient'

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string
    status?: string
    vehicleId?: string
    customerId?: string
    source?: string
    dateFrom?: string
    dateTo?: string
  }>
}) {
  const params = await searchParams
  const [bookings, { vehicles, customers }] = await Promise.all([
    getBookings(
      params.search,
      params.status,
      params.vehicleId,
      params.customerId,
      params.source,
      params.dateFrom,
      params.dateTo
    ),
    getBookingFormData(),
  ])

  return (
    <BookingsPageClient
      bookings={bookings}
      vehicles={vehicles}
      customers={customers}
      filters={params}
    />
  )
}
