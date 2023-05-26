import { renderHook } from '@testing-library/react'

import { useRepoBackfilled } from 'services/repo'

import { useRepoBackfillingStatus } from './hooks'

jest.mock('services/repo')

const repoBackfillData = {
  flagsMeasurementsActive: true,
  flagsMeasurementsBackfilled: true,
}

describe('useRepoBackfillingStatus', () => {
  let hookData

  function setup(data = repoBackfillData) {
    useRepoBackfilled.mockReturnValue({ data })
    hookData = renderHook(() => useRepoBackfillingStatus())
  }

  describe('when backfilling is done', () => {
    it('returns data accordingly', () => {
      setup()
      expect(hookData.result.current).toEqual({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: true,
        isRepoBackfilling: false,
      })
    })
  })

  describe('when backfilling is not done', () => {
    it('returns data accordingly', () => {
      setup({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: false,
      })

      expect(hookData.result.current).toEqual({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: false,
        isRepoBackfilling: true,
      })
    })
  })
})
