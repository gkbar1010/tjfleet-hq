'use client'

import { useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core'
import { getCalendarBookings } from '@/actions/calendar'

const STATUS_COLORS: Record<string, string> = {
  INQUIRY: '#525252',
  PENDING: '#ca8a04',
  CONFIRMED: '#2563eb',
  ACTIVE: '#16a34a',
  COMPLETED: '#404040',
  CANCELLED: '#dc2626',
}

export default function CalendarClient() {
  const router = useRouter()
  const calendarRef = useRef<FullCalendar>(null)

  const handleDatesSet = useCallback(
    async (arg: DatesSetArg) => {
      const calendarApi = arg.view.calendar
      const start = arg.startStr
      const end = arg.endStr

      try {
        const bookings = await getCalendarBookings(start, end)
        const events: EventInput[] = bookings.map((b) => ({
          id: b.id,
          title: b.title,
          start: b.start,
          end: b.end,
          backgroundColor: STATUS_COLORS[b.status] || '#525252',
          borderColor: STATUS_COLORS[b.status] || '#525252',
          textColor: '#ffffff',
        }))

        // Remove existing events and add new ones
        calendarApi.removeAllEvents()
        events.forEach((e) => calendarApi.addEvent(e))
      } catch (error) {
        console.error('Failed to fetch calendar bookings:', error)
      }
    },
    []
  )

  const handleEventClick = useCallback(
    (arg: EventClickArg) => {
      const bookingId = arg.event.id
      if (bookingId) {
        router.push(`/bookings/${bookingId}`)
      }
    },
    [router]
  )

  return (
    <div className="calendar-dark">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        height="auto"
        datesSet={handleDatesSet}
        eventClick={handleEventClick}
        eventDisplay="block"
        dayMaxEvents={4}
        nowIndicator
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
      />

      <style jsx global>{`
        .calendar-dark {
          --fc-border-color: #404040;
          --fc-button-bg-color: #262626;
          --fc-button-border-color: #404040;
          --fc-button-hover-bg-color: #404040;
          --fc-button-hover-border-color: #525252;
          --fc-button-active-bg-color: #525252;
          --fc-button-active-border-color: #525252;
          --fc-today-bg-color: rgba(37, 99, 235, 0.08);
          --fc-neutral-bg-color: #171717;
          --fc-page-bg-color: transparent;
          --fc-event-border-color: transparent;
          --fc-now-indicator-color: #2563eb;
        }
        .calendar-dark .fc {
          color: #ffffff;
        }
        .calendar-dark .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #ffffff;
        }
        .calendar-dark .fc-button {
          font-size: 0.8125rem;
          font-weight: 500;
          padding: 0.375rem 0.75rem;
          text-transform: capitalize;
        }
        .calendar-dark .fc-col-header-cell-cushion,
        .calendar-dark .fc-daygrid-day-number,
        .calendar-dark .fc-timegrid-slot-label-cushion {
          color: #a3a3a3;
          font-size: 0.8125rem;
        }
        .calendar-dark .fc-daygrid-day-number {
          padding: 4px 8px;
        }
        .calendar-dark .fc-event {
          cursor: pointer;
          font-size: 0.75rem;
          padding: 2px 4px;
          border-radius: 4px;
        }
        .calendar-dark .fc-daygrid-event {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .calendar-dark .fc-day-other .fc-daygrid-day-number {
          color: #525252;
        }
        .calendar-dark .fc-scrollgrid {
          border-color: #404040;
        }
        .calendar-dark .fc-timegrid-now-indicator-line {
          border-color: #2563eb;
        }
        .calendar-dark .fc-more-link {
          color: #a3a3a3;
          font-size: 0.75rem;
        }
        .calendar-dark .fc-popover {
          background-color: #262626;
          border-color: #404040;
        }
        .calendar-dark .fc-popover-header {
          background-color: #171717;
          color: #ffffff;
        }
      `}</style>
    </div>
  )
}
