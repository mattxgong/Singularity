import { describe, expect, it } from 'vitest'
import { formatDate } from './format'

describe('formatDate', () => {
  it('formats dates in UTC without shifting the calendar day', () => {
    expect(formatDate('2024-01-02T23:30:00-08:00')).toBe('January 3, 2024')
  })
})
