'use client'

import { useCallback, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core'
import { getCalendarBookings } from '@/actions/calendar'

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  INQUIRY: { bg: '#525252', border: '#666' },
  PENDING: { bg: '#b45309', border: '#d97706' },
  CONFIRMED: { bg: '#1d4ed8', border: '#3b82f6' },
  ACTIVE: { bg: '#15803d', border: '#22c55e' },
  COMPLETED: { bg: '#333', border: '#555' },
  CANCELLED: { bg: '#991b1b', border: '#dc2626' },
}

const STATUS_LABELS: Record<string, string> = {
  INQUIRY: 'Inquiry',
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export default function CalendarClient() {
  const router = useRouter()
  const calendarRef = useRef<FullCalendar>(null)
  const [loading, setLoading] = useState(false)

  const handleDatesSet = useCallback(
    async (arg: DatesSetArg) => {
      const calendarApi = arg.view.calendar
      const start = arg.startStr
      const end = arg.endStr

      setLoading(true)
      try {
        const bookings = await getCalendarBookings(start, end)
        const events: EventInput[] = bookings.map((b) => {
          const colors = STATUS_COLORS[b.status] || STATUS_COLORS.INQUIRY
          return {
            id: b.id,
            title: b.title,
            start: b.start,
            end: b.end,
            backgroundColor: colors.bg,
            borderColor: colors.border,
            textColor: '#ffffff',
          }
        })

        calendarApi.removeAllEvents()
        events.forEach((e) => calendarApi.addEvent(e))
      } catch (error) {
        console.error('Failed to fetch calendar bookings:', error)
      } finally {
        setLoading(false)
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
    <div>
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mb-5">
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: STATUS_COLORS[key]?.bg }}
            />
            <span className="text-xs text-[#888]">{label}</span>
          </div>
        ))}
        {loading && (
          <span className="text-xs text-[#E10600] ml-auto">Loading...</span>
        )}
      </div>

      <div className="bg-[#0e0e0e] border border-[#1a1a1a] rounded-xl p-4 overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          timeZone="America/New_York"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="auto"
          datesSet={handleDatesSet}
          eventClick={handleEventClick}
          eventDisplay="block"
          dayMaxEvents={3}
          nowIndicator
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="01:00:00"
          allDaySlot={false}
          eventTimeFormat={{
            hour: 'numeric',
            minute: '2-digit',
            meridiem: 'short',
          }}
          views={{
            dayGridMonth: {
              dayMaxEvents: 3,
            },
            timeGridWeek: {
              slotDuration: '01:00:00',
            },
            timeGridDay: {
              slotDuration: '00:30:00',
            },
          }}
        />
      </div>

      <style jsx global>{`
        /* FullCalendar Rosso Italia Theme */
        .fc {
          --fc-border-color: #1e1e1e;
          --fc-page-bg-color: transparent;
          --fc-neutral-bg-color: #0e0e0e;
          --fc-today-bg-color: rgba(225, 6, 0, 0.04);
          --fc-now-indicator-color: #E10600;
          --fc-event-border-color: transparent;
          --fc-list-event-hover-bg-color: #141414;
          font-family: 'Rajdhani', sans-serif;
        }

        .fc .fc-toolbar {
          margin-bottom: 1.25rem !important;
        }

        .fc .fc-toolbar-title {
          font-family: 'Orbitron', monospace !important;
          font-weight: 700 !important;
          font-size: 1rem !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #fff !important;
        }

        .fc .fc-button-group {
          gap: 2px;
        }

        .fc .fc-button {
          font-family: 'Rajdhani', sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.8rem !important;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 6px 14px !important;
          border-radius: 6px !important;
          background: #141414 !important;
          border: 1px solid #1e1e1e !important;
          color: #888 !important;
          transition: all 0.15s ease !important;
        }

        .fc .fc-button:hover {
          background: #1a1a1a !important;
          border-color: #E10600 !important;
          color: #fff !important;
        }

        .fc .fc-button-active,
        .fc .fc-button:not(:disabled).fc-button-active {
          background: #E10600 !important;
          border-color: #E10600 !important;
          color: #fff !important;
          box-shadow: 0 0 12px rgba(225, 6, 0, 0.3) !important;
        }

        .fc .fc-today-button {
          background: transparent !important;
          border: 1px solid #E10600 !important;
          color: #E10600 !important;
        }

        .fc .fc-today-button:hover {
          background: #E10600 !important;
          color: #fff !important;
        }

        .fc .fc-today-button:disabled {
          opacity: 0.3 !important;
        }

        .fc .fc-col-header-cell {
          background: #111;
          border-color: #1e1e1e;
        }

        .fc .fc-col-header-cell-cushion {
          color: #777;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 10px 0;
        }

        .fc .fc-daygrid-day-number {
          color: #666;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 6px 10px;
        }

        .fc .fc-day-today .fc-daygrid-day-number {
          color: #E10600;
          font-weight: 700;
        }

        .fc .fc-daygrid-day-frame {
          min-height: 90px;
        }

        .fc .fc-event {
          cursor: pointer;
          font-size: 0.75rem;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          padding: 3px 6px;
          border-radius: 4px;
          border-left: 3px solid;
          transition: opacity 0.15s ease;
        }

        .fc .fc-event:hover {
          opacity: 0.85;
        }

        .fc .fc-daygrid-event {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .fc .fc-day-other .fc-daygrid-day-number {
          color: #333;
        }

        .fc .fc-scrollgrid,
        .fc .fc-scrollgrid-section > td,
        .fc td,
        .fc th {
          border-color: #1e1e1e !important;
        }

        .fc .fc-timegrid-now-indicator-line {
          border-color: #E10600;
          border-width: 2px;
        }

        .fc .fc-timegrid-now-indicator-arrow {
          border-color: #E10600;
        }

        .fc .fc-timegrid-slot-label-cushion {
          color: #555;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 600;
          font-size: 0.8rem;
        }

        .fc .fc-more-link {
          color: #E10600;
          font-weight: 600;
          font-size: 0.75rem;
        }

        .fc .fc-more-link:hover {
          color: #FF2D2D;
        }

        .fc .fc-popover {
          background: #141414;
          border-color: #222;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0,0,0,0.5);
        }

        .fc .fc-popover-header {
          background: #111;
          color: #fff;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          padding: 8px 12px;
        }

        .fc .fc-popover-body {
          padding: 4px;
        }

        /* Week/Day view slots */
        .fc .fc-timegrid-slot {
          height: 50px;
        }

        .fc .fc-timegrid-col {
          border-color: #1e1e1e;
        }
      `}</style>
    </div>
  )
}
