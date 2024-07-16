import {
  genSizeColumn,
  sortChangeOverTimeColumn,
  sortSizeColumn,
} from './assetTableHelpers'

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

describe('sortSizeColumn', () => {
  describe('rows are number', () => {
    describe('rowA is greater than rowB', () => {
      it('returns 1', () => {
        const val = sortSizeColumn({
          rowA: 5,
          rowB: 4,
          totalBundleSize: 10,
        })
        expect(val).toBe(1)
      })
    })

    describe('rowA is less than rowB', () => {
      it('returns -1', () => {
        const val = sortSizeColumn({
          rowA: 4,
          rowB: 5,
          totalBundleSize: 10,
        })
        expect(val).toBe(-1)
      })
    })

    describe('rowA is equal to rowB', () => {
      it('returns 0', () => {
        const val = sortSizeColumn({
          rowA: 5,
          rowB: 5,
          totalBundleSize: 10,
        })
        expect(val).toBe(0)
      })
    })
  })

  describe('total bundle size is not a number', () => {
    describe('rowA is greater than rowB', () => {
      it('returns 1', () => {
        const val = sortSizeColumn({
          rowA: 5,
          rowB: 4,
          totalBundleSize: null,
        })
        expect(val).toBe(1)
      })
    })

    describe('rowA is less than rowB', () => {
      it('returns -1', () => {
        const val = sortSizeColumn({
          rowA: 4,
          rowB: 5,
          totalBundleSize: null,
        })
        expect(val).toBe(-1)
      })
    })

    describe('rowA is equal to rowB', () => {
      it('returns 0', () => {
        const val = sortSizeColumn({
          rowA: 5,
          rowB: 5,
          totalBundleSize: null,
        })
        expect(val).toBe(0)
      })
    })
  })
})

describe('sortChangeOverTimeColumn', () => {
  describe('rows are numbers', () => {
    describe('rowA is greater than rowB', () => {
      it('returns 1', () => {
        const val = sortChangeOverTimeColumn({
          rowA: 5,
          rowB: 4,
        })
        expect(val).toBe(1)
      })
    })

    describe('rowA is less than rowB', () => {
      it('returns -1', () => {
        const val = sortChangeOverTimeColumn({
          rowA: 4,
          rowB: 5,
        })
        expect(val).toBe(-1)
      })
    })

    describe('rowA is equal to rowB', () => {
      it('returns 0', () => {
        const val = sortChangeOverTimeColumn({
          rowA: 5,
          rowB: 5,
        })
        expect(val).toBe(0)
      })
    })
  })

  describe('rows are not numbers', () => {
    it('returns -1', () => {
      const val = sortChangeOverTimeColumn({
        rowA: null,
        rowB: null,
      })
      expect(val).toBe(-1)
    })
  })
})
