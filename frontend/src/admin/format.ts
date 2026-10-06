const number = new Intl.NumberFormat()
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const dayLong = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
const dayShort = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

export const fmtNumber = (n: number) => number.format(n)
export const fmtDateTime = (iso: string) => dateTime.format(new Date(iso))

/** "YYYY-MM-DD" as a local calendar date (not shifted by UTC parsing). */
const localDay = (ymd: string) => {
  const [y, m, d] = ymd.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const fmtDayLong = (ymd: string) => dayLong.format(localDay(ymd))
export const fmtDayShort = (ymd: string) => dayShort.format(localDay(ymd))

export function fmtRelative(iso: string, now = Date.now()) {
  const s = Math.round((new Date(iso).getTime() - now) / 1000)
  const abs = Math.abs(s)
  if (abs < 45) return 'just now'
  if (abs < 3600) return relative.format(Math.round(s / 60), 'minute')
  if (abs < 86400) return relative.format(Math.round(s / 3600), 'hour')
  if (abs < 86400 * 30) return relative.format(Math.round(s / 86400), 'day')
  return dateTime.format(new Date(iso))
}
