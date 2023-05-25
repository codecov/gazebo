import { renderHook } from '@testing-library/react'

import { formatTimeToNow, useDateFormatted } from './dates'

describe('useDateFormatted and formatTimeToNow functions', () => {
  let formattedDate

  function setup(date, formatDescription) {
    formattedDate = formatTimeToNow(date)
  }

  describe('when called with no date', () => {
    beforeEach(() => {
      setup(null)
    })

    it('returns null', () => {
      const { result } = renderHook(() => useDateFormatted(null))

      expect(result.current).toBe(null)
      expect(formattedDate).toBe(null)
    })
  })

  describe('when called with a iso date', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-09-01'))
      setup('2020-09-08T10:45:06Z')
    })

    it('returns the date with the default format', () => {
      const { result } = renderHook(() =>
        useDateFormatted('2020-09-08T10:45:06Z')
      )

      expect(result.current).toBe('September 8th 2020')
      expect(formattedDate).toBe('almost 2 years ago')
    })
  })

  describe('when called with an alternative date format', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-09-01'))
      setup('2020-09-08T10:45:06Z', 'MMMM yyyy')
    })

    it('returns the date with the right format', () => {
      const { result } = renderHook(() =>
        useDateFormatted('2020-09-08T10:45:06Z', 'MMMM yyyy')
      )

      expect(result.current).toBe('September 2020')
      expect(formattedDate).toBe('almost 2 years ago')
    })
  })

  describe('when called with a unix timestamp', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date('2022-09-01'))
      setup(1595270468)
    })

    it('returns the date with the default format', () => {
      const { result } = renderHook(() => useDateFormatted(1595270468))

      expect(result.current).toBe('July 20th 2020')
      expect(formattedDate).toBe('about 2 years ago')
    })
  })
})
