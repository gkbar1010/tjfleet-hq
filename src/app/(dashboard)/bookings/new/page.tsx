import { getBookingFormData } from '@/actions/bookings'
import BookingForm from '@/components/bookings/BookingForm'

export default async function NewBookingPage() {
  const { vehicles, customers } = await getBookingFormData()

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">New Booking</h1>
      <BookingForm vehicles={vehicles} customers={customers} />
    </div>
  )
}
