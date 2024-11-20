import { formatTimeFromSeconds, formatTimeToNow } from './dates'

describe('formatTimeToNow', () => {
  it('returns null when date is null', () => {
    expect(formatTimeToNow(undefined)).toBe(null)
  })

  it('returns the correct time format when date is a unix timestamp', () => {
    vi.useFakeTimers().setSystemTime(new Date('2025-01-01'))
    expect(formatTimeToNow(1715731200)).toBe('8 months ago')
    vi.useRealTimers()
  })

  it('returns the correct time format when date is a iso string', () => {
    vi.useFakeTimers().setSystemTime(new Date('2025-01-01'))
    expect(formatTimeToNow('2024-09-01')).toBe('4 months ago')
    vi.useRealTimers()
  })
})

describe('formatTimeFromSeconds', () => {
  it('returns "N/A" when totalSeconds is null', () => {
    expect(formatTimeFromSeconds(null)).toBe('N/A')
  })

  it('returns "N/A" when totalSeconds is undefined', () => {
    expect(formatTimeFromSeconds(undefined)).toBe('N/A')
  })

  it('returns "0s" when totalSeconds is 0', () => {
    expect(formatTimeFromSeconds(0)).toBe('0s')
  })

  it('returns the correct time format when totalSeconds is greater than 0', () => {
    expect(formatTimeFromSeconds(3661)).toBe('1h 1m 1s')
  })
})
