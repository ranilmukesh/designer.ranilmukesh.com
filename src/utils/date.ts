export function getYear(date: string | null | undefined): string | null {
  if (!date)
    return null

  const year = date.slice(0, 4)
  return /^\d{4}$/.test(year)
    ? year
    : null
}

export function formatDateRange(
  start: string,
  end?: string | null,
  ongoing = 'Present',
): string {
  return `${getYear(start) ?? start} - ${getYear(end) ?? ongoing}`
}

export function formatPeriod(
  start: string,
  end?: string | null,
  ongoing = 'NOW',
): string {
  const startLabel = start.slice(0, 7).replace('-', '.')
  const endLabel = end
    ? end.slice(0, 7).replace('-', '.')
    : ongoing
  return `${startLabel} → ${endLabel}`
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

/** "2026-05-02" -> "May 2026"; falls back to the year alone. */
export function formatMonthYear(date: string): string {
  const [year, month] = date.split('-')
  const label = MONTHS[Number(month) - 1]
  return label
    ? `${label} ${year}`
    : year ?? date
}
