import { renderHook } from '@testing-library/react-hooks'

import { formatTimeToNow, useDateFormatted } from './dates'

describe('useDateFormatted and formatTimeToNow functions', () => {
  let hookData, formattedDate

  function setup(date, formatDescription) {
    hookData = renderHook(() => useDateFormatted(date, formatDescription))
    formattedDate = formatTimeToNow(date)
  }

  describe('when called with no date', () => {
    beforeEach(() => {
      setup(null)
    })

    it('returns null', () => {
      expect(hookData.result.current).toBe(null)
      expect(formattedDate).toBe(null)
    })
  })

  describe('when called with a iso date', () => {
    beforeEach(() => {
      setup('2020-09-08T10:45:06Z')
    })

    it('returns the date with the default format', () => {
      expect(hookData.result.current).toBe('September 8th 2020')
      expect(formattedDate).toBe('over 1 year ago')
    })
  })

  describe('when called with an alternative date format', () => {
    beforeEach(() => {
      setup('2020-09-08T10:45:06Z', 'MMMM yyyy')
    })

    it('returns the date with the right format', () => {
      expect(hookData.result.current).toBe('September 2020')
      expect(formattedDate).toBe('over 1 year ago')
    })
  })

  describe('when called with a unix timestamp', () => {
    beforeEach(() => {
      setup(1595270468)
    })

    it('returns the date with the default format', () => {
      expect(hookData.result.current).toBe('July 20th 2020')
      expect(formattedDate).toBe('almost 2 years ago')
    })
  })
})
