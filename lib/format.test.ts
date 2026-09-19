import { describe, expect, it } from 'vitest'
import { formatDate, formatPeriod } from './format'

describe('formatDate', () => {
  it('formats dates in UTC without shifting the calendar day', () => {
    expect(formatDate('2024-01-02T23:30:00-08:00')).toBe('January 3, 2024')
  })
})

describe('formatPeriod', () => {
  it('formats a closed month range', () => {
    expect(formatPeriod({ start: '2025-01', end: '2025-08' })).toBe('January 2025 to August 2025')
  })

  it('formats an open-ended range as present', () => {
    expect(formatPeriod({ start: '2026-04' })).toBe('April 2026 to Present')
  })
})
