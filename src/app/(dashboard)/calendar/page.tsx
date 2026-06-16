import CalendarClient from '@/components/calendar/CalendarClient'

export const dynamic = 'force-dynamic'

export default function CalendarPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
              Calendario
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="h-[2px] w-8 bg-[#E10600]" style={{ boxShadow: '0 0 6px rgba(225,6,0,0.4)' }} />
              <span className="text-[9px] text-[#444] tracking-[0.2em] uppercase" style={{ fontFamily: 'Orbitron, monospace' }}>
                Eastern Time
              </span>
            </div>
          </div>
        </div>
      </div>
      <CalendarClient />
    </div>
  )
}
