const dateFormatters = new Map<string, Intl.DateTimeFormat>()

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
