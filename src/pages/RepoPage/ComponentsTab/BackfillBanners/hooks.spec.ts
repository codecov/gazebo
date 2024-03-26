import { renderHook } from '@testing-library/react'

import { useRepoBackfilled } from 'services/repo'

import { useRepoBackfillingStatus } from './hooks'

jest.mock('services/repo')

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
    const mockedUseRepoBackfilled = useRepoBackfilled as jest.Mock
    mockedUseRepoBackfilled.mockReturnValue({ data })
    return renderHook(() => useRepoBackfillingStatus())
  }

  describe('when backfilling is done', () => {
    it('returns data accordingly', () => {
      const { result } = setup()
      expect(result.current).toEqual({
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: true,
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
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: false,
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
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: false,
        isRepoBackfilling: true,
        isTimescaleEnabled: true,
      })
    })
  })
})
