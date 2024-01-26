import { formatSizeToString } from './bundleAnalysis'

describe('formatSizeToString', () => {
  describe('size is less then one kilobyte', () => {
    describe('size is a positive number', () => {
      it('returns size in bytes', () => {
        const result = formatSizeToString(900)
        expect(result).toBe('900B')
      })
    })

    describe('size is a negative number', () => {
      it('returns size in bytes', () => {
        const result = formatSizeToString(-900)
        expect(result).toBe('-900B')
      })
    })
  })

  describe('size is greater then one kilobyte and smaller then one megabyte', () => {
    describe('size is a positive number', () => {
      it('returns size in kilobytes', () => {
        const result = formatSizeToString(10000)
        expect(result).toBe('10kB')
      })
    })

    describe('size is a negative number', () => {
      it('returns size in kilobytes', () => {
        const result = formatSizeToString(-10000)
        expect(result).toBe('-10kB')
      })
    })
  })

  describe('size is greater then one megabyte and smaller then gigabyte', () => {
    describe('size is a positive number', () => {
      it('returns size in megabytes', () => {
        const result = formatSizeToString(1000000)
        expect(result).toBe('1MB')
      })
    })

    describe('size is a negative number', () => {
      it('returns size in megabytes', () => {
        const result = formatSizeToString(-1000000)
        expect(result).toBe('-1MB')
      })
    })
  })

  describe('size is greater then gigabyte', () => {
    describe('size is a positive number', () => {
      it('returns size in gigabytes', () => {
        const result = formatSizeToString(1000000000)
        expect(result).toBe('1GB')
      })
    })

    describe('size is a negative number', () => {
      it('returns size in gigabytes', () => {
        const result = formatSizeToString(-1000000000)
        expect(result).toBe('-1GB')
      })
    })
  })

  describe('handles decimal numbers', () => {
    describe('size is a positive number', () => {
      it('returns size with two decimal places', () => {
        const result = formatSizeToString(12345678)
        expect(result).toBe('12.35MB')
      })
    })

    describe('size is a negative number', () => {
      it('returns size with two decimal places', () => {
        const result = formatSizeToString(-12345678)
        expect(result).toBe('-12.35MB')
      })
    })
  })
})
