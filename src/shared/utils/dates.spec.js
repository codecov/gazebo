import { renderHook } from '@testing-library/react-hooks'

import { formatTimeToNow, useDateFormatted } from './dates'

describe('useDateFormatted and formatTimeToNow functions', () => {
  describe('when called with no date', () => {
    it('returns null', () => {
      const { result } = renderHook(() => useDateFormatted(null))
      expect(result.current).toBe(null)
      expect(formatTimeToNow(null)).toBe(null)
    })
  })

  describe('when called with a iso date', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-09-01'))
    })

    it('returns the date with the default format', () => {
      const { result } = renderHook(() =>
        useDateFormatted('2020-09-08T10:45:06Z')
      )
      expect(result.current).toBe('September 8th 2020')
      expect(formatTimeToNow('2020-09-08T10:45:06Z')).toBe('almost 2 years ago')
    })
  })

  describe('when called with an alternative date format', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-09-01'))
    })

    it('returns the date with the right format', () => {
      const { result } = renderHook(() =>
        useDateFormatted('2020-09-08T10:45:06Z', 'MMMM yyyy')
      )
      expect(result.current).toBe('September 2020')
      expect(formatTimeToNow('2020-09-08T10:45:06Z')).toBe('almost 2 years ago')
    })
  })

  describe('when called with a unix timestamp', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-09-01'))
    })

    it('returns the date with the default format', () => {
      const { result } = renderHook(() => useDateFormatted(1595270468))
      expect(result.current).toBe('July 20th 2020')
      expect(formatTimeToNow(1595270468)).toBe('about 2 years ago')
    })
  })
})
