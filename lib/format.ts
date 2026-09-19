const dateFormatters = new Map<string, Intl.DateTimeFormat>()
const monthFormatters = new Map<string, Intl.DateTimeFormat>()

import type { Period } from '@/data/types'

export function formatDate(date: string | Date, locale = 'en-US'): string {
  let formatter = dateFormatters.get(locale)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
    dateFormatters.set(locale, formatter)
  }

  return formatter.format(new Date(date))
}

function formatMonth(month: string, locale: string): string {
  let formatter = monthFormatters.get(locale)

  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      timeZone: 'UTC',
    })
    monthFormatters.set(locale, formatter)
  }

  return formatter.format(new Date(`${month}-01T00:00:00Z`))
}

export function formatPeriod(period: Period, locale = 'en-US'): string {
  const start = formatMonth(period.start, locale)
  const end = period.end ? formatMonth(period.end, locale) : 'Present'
  return `${start} to ${end}`
}
