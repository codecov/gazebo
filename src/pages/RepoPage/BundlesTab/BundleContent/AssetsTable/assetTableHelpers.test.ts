import { genSizeColumn } from './assetTableHelpers'

describe('genSizeColumn', () => {
  describe('totalBundleSize is undefined', () => {
    it('returns just the size', () => {
      const val = genSizeColumn({ size: 4000, totalBundleSize: undefined })
      expect(val).toBe('4kB')
    })
  })

  describe('totalBundleSize is null', () => {
    it('returns just the size', () => {
      const val = genSizeColumn({ size: 4000, totalBundleSize: undefined })
      expect(val).toBe('4kB')
    })
  })

  describe('totalBundleSize is defined', () => {
    it('returns the size and percentage', () => {
      const val = genSizeColumn({ size: 4000, totalBundleSize: 4000 })
      expect(val).toBe('100% (4kB)')
    })
  })
})
