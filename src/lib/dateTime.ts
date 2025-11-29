const pad = (value: number): string => (value < 10 ? `0${value}` : String(value))

export function formatDateInput(date: Date): string {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())

  return `${year}-${month}-${day}`
}

export function formatDateTimeLocalInput(date: Date): string {
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hours = pad(date.getHours())
  const minutes = pad(date.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function nowLocalForDateTimeInput(): string {
  return formatDateTimeLocalInput(new Date())
}

export function localDateTimeInputToUtcIso(value: string): string {
  const date = new Date(value)

  return date.toISOString()
}

export function localDateToUtcStartOfDayIso(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00`)

  return date.toISOString()
}

export function localDateToUtcEndOfDayIso(dateStr: string): string {
  const date = new Date(`${dateStr}T23:59:59`)

  return date.toISOString()
}

export type DatePreset = '3d' | '7d' | '14d' | '28d' | '3m' | '12m'

export function getPresetRange(preset: DatePreset): { from: string; to: string } {
  const now = new Date()
  const to = new Date(now.getTime())
  const from = new Date(now.getTime())

  switch (preset) {
    case '3d':
      from.setDate(from.getDate() - 3)
      break
    case '7d':
      from.setDate(from.getDate() - 7)
      break
    case '14d':
      from.setDate(from.getDate() - 14)
      break
    case '28d':
      from.setDate(from.getDate() - 28)
      break
    case '3m':
      from.setMonth(from.getMonth() - 3)
      break
    case '12m':
      from.setFullYear(from.getFullYear() - 1)
      break
    default:
      break
  }

  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
  }
}
