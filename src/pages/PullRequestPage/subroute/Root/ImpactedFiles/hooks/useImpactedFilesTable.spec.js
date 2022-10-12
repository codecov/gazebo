import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'

import { usePull } from 'services/pull'

import useImpactedFilesTable from './useImpactedFilesTable'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))
jest.mock('services/pull')

const mockImpactedFiles = {
  data: {
    pullBaseCoverage: 41.66667,
    pullHeadCoverage: 92.30769,
    pullPatchCoverage: 1,
    impactedFiles: [
      {
        changeCoverage: 58.333333333333336,
        hasHeadOrPatchCoverage: true,
        headCoverage: 90.23,
        headName: 'flag1/mafs.js',
        patchCoverage: 27.43,
      },
    ],
  },
  isLoading: false,
}

describe('useImpactedFilesTable', () => {
  let hookData
  function setup() {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      pull: 14,
    })
    usePull.mockReturnValue(mockImpactedFiles)

    hookData = renderHook(() => useImpactedFilesTable({}))
  }

  describe('comparisons', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data', async () => {
      expect(hookData.result.current.data).toEqual({
        impactedFiles: [
          {
            changeCoverage: 58.333333333333336,
            hasHeadOrPatchCoverage: true,
            headCoverage: 90.23,
            headName: 'flag1/mafs.js',
            patchCoverage: 27.43,
          },
        ],
        pullBaseCoverage: 41.66667,
        pullHeadCoverage: 92.30769,
        pullPatchCoverage: 1,
      })
    })
  })
})
