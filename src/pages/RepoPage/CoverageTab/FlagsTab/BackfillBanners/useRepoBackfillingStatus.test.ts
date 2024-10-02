import { renderHook } from '@testing-library/react'

import { useRepoBackfillingStatus } from './useRepoBackfillingStatus'

const mocks = vi.hoisted(() => ({
  useRepoBackfilled: vi.fn(),
}))

vi.mock('services/repo', async () => {
  const actual = await vi.importActual('services/repo')
  return {
    ...actual,
    useRepoBackfilled: mocks.useRepoBackfilled,
  }
})

type MockType = {
  flagsMeasurementsActive?: boolean
  flagsMeasurementsBackfilled?: boolean
  isTimescaleEnabled?: boolean
}

const repoBackfillData: MockType = {
  flagsMeasurementsActive: true,
  flagsMeasurementsBackfilled: true,
}

describe('useRepoBackfillingStatus', () => {
  function setup(data = repoBackfillData) {
    mocks.useRepoBackfilled.mockReturnValue({ data })
    return renderHook(() => useRepoBackfillingStatus())
  }

  describe('when backfilling is done', () => {
    it('returns data accordingly', () => {
      const { result } = setup()
      expect(result.current).toEqual({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        isRepoBackfilling: false,
      })
    })
  })

  describe('when backfilling is not done', () => {
    it('returns data accordingly', () => {
      const { result } = setup({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: false,
      })
      expect(result.current).toEqual({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: false,
        isRepoBackfilling: true,
      })
    })
  })

  describe('returns timescale value when true', () => {
    it('returns data accordingly', () => {
      const { result } = setup({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: false,
        isTimescaleEnabled: true,
      })
      expect(result.current).toEqual({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: false,
        isRepoBackfilling: true,
        isTimescaleEnabled: true,
      })
    })
  })
})
