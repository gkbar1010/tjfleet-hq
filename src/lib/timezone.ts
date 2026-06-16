/**
 * Eastern Time utilities.
 * All operations use America/New_York which handles EST/EDT automatically.
 */

const TIMEZONE = 'America/New_York'

/** Get current date/time in Eastern */
export function nowEastern(): Date {
  const now = new Date()
  const eastern = new Date(now.toLocaleString('en-US', { timeZone: TIMEZONE }))
  return eastern
}

/** Get start of today in Eastern, returned as UTC Date for DB queries */
export function todayStartUTC(): Date {
  const eastern = nowEastern()
  const startOfDay = new Date(eastern.getFullYear(), eastern.getMonth(), eastern.getDate())
  // Convert back to UTC by finding the offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = formatter.formatToParts(new Date())
  const year = parseInt(parts.find(p => p.type === 'year')!.value)
  const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1
  const day = parseInt(parts.find(p => p.type === 'day')!.value)

  // Create a date string in Eastern and parse it
  const easternMidnight = new Date(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`)

  // Get the UTC offset for this date in Eastern timezone
  const utcDate = new Date(Date.UTC(year, month, day))
  const easternStr = utcDate.toLocaleString('en-US', { timeZone: TIMEZONE })
  const easternDate = new Date(easternStr)
  const offsetMs = utcDate.getTime() - easternDate.getTime()

  // Start of today in Eastern, expressed as UTC
  return new Date(easternMidnight.getTime() + offsetMs)
}

/** Get end of today in Eastern, returned as UTC Date for DB queries */
export function todayEndUTC(): Date {
  const start = todayStartUTC()
  return new Date(start.getTime() + 24 * 60 * 60 * 1000)
}

/** Format a date for display in Eastern timezone */
export function formatEastern(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    timeZone: TIMEZONE,
    ...options,
  })
}

export { TIMEZONE }
