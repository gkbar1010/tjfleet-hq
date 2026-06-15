import CalendarClient from '@/components/calendar/CalendarClient'

export default function CalendarPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <p className="text-sm text-neutral-400 mt-1">View and manage booking schedule</p>
      </div>
      <CalendarClient />
    </div>
  )
}
