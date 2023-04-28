import { renderHook } from '@testing-library/react-hooks'

import { useRepoBackfilled } from 'services/repo'

import { useRepoBackfillingStatus } from './useRepoBackfillingStatus'

jest.mock('services/repo')

const repoBackfillData = {
  flagsMeasurementsActive: true,
  flagsMeasurementsBackfilled: true,
}

describe('useRepoBackfillingStatus', () => {
  function setup(data = repoBackfillData) {
    useRepoBackfilled.mockReturnValue({ data })
  }

  describe('when backfilling is done', () => {
    it('returns data accordingly', () => {
      setup()
      const { result } = renderHook(() => useRepoBackfillingStatus())
      expect(result.current).toEqual({
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
      const { result } = renderHook(() => useRepoBackfillingStatus())

      expect(result.current).toEqual({
        flagsMeasurementsActive: true,
        flagsMeasurementsBackfilled: false,
        isRepoBackfilling: true,
      })
    })
  })
})
