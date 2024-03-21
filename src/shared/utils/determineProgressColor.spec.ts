import { determineProgressColor } from './determineProgressColor'

describe('determineProgressColor', () => {
  describe('coverage value is above upper range', () => {
    it('returns primary', () => {
      const result = determineProgressColor({
        coverage: 100,
        upperRange: 80,
        lowerRange: 60,
      })

      expect(result).toBe('primary')
    })
  })

  describe('coverage value is between upper and lower range', () => {
    it('returns warning', () => {
      const result = determineProgressColor({
        coverage: 70,
        upperRange: 80,
        lowerRange: 60,
      })

      expect(result).toBe('warning')
    })
  })

  describe('coverage value is below lower range', () => {
    it('returns danger', () => {
      const result = determineProgressColor({
        coverage: 50,
        upperRange: 80,
        lowerRange: 60,
      })

      expect(result).toBe('danger')
    })
  })

  describe('coverage value is not a number', () => {
    it('returns default', () => {
      const result = determineProgressColor({
        coverage: null,
        upperRange: 80,
        lowerRange: 60,
      })

      expect(result).toBe('primary')
    })
  })
})
