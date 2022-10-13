import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { usePull } from 'services/pull'

import useImpactedFilesTable from './useImpactedFilesTable'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))
jest.mock('services/pull')

// const mockImpactedFiles = {
//   data: {
//     pullBaseCoverage: 41.66667,
//     pullHeadCoverage: 92.30769,
//     pullPatchCoverage: 1,
// impactedFiles: [
//   {
//     changeCoverage: 58.333333333333336,
//     hasHeadOrPatchCoverage: true,
//     headCoverage: 90.23,
//     headName: 'flag1/mafs.js',
//     patchCoverage: 27.43,
//   },
// ],
//   },
//   isLoading: false,
// }

const mockPull = {
  data: {
    pull: {
      pullId: 14,
      head: {
        state: 'PROCESSED',
      },
      compareWithBase: {
        patchTotals: {
          percentCovered: 92.12,
        },
        headTotals: {
          percentCovered: 74.2,
        },
        baseTotals: {
          percentCovered: 27.35,
        },
        changeWithParent: 38.94,
        impactedFiles: [
          {
            isCriticalFile: true,
            fileName: 'mafs.js',
            headName: 'flag1/mafs.js',
            baseCoverage: {
              percentCovered: 45.38,
            },
            headCoverage: {
              percentCovered: 90.23,
            },
            patchCoverage: {
              percentCovered: 27.43,
            },
          },
        ],
      },
    },
  },
}

describe('useRepoContentsTable', () => {
  let hookData
  function setup() {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      pull: 14,
    })
    usePull.mockReturnValue(mockPull)

    hookData = renderHook(() => useImpactedFilesTable({}))
  }

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      setup()
    })

    it('calls useRepoContents with correct filters value', async () => {
      act(() => {
        hookData.result.current.handleSort([{ desc: false, id: 'name' }])
      })

      await waitFor(() =>
        expect(usePull).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'DESC', parameter: 'CHANGE_COVERAGE' },
          },
          owner: 'Rabee-AbuBaker',
          options: {
            staleTime: 300000,
          },
          provider: 'gh',
          pullId: undefined,
          repo: 'another-test',
        })
      )

      act(() => {
        hookData.result.current.handleSort([{ desc: true, id: 'coverage' }])
      })

      await waitFor(() =>
        expect(usePull).toHaveBeenCalledWith({
          filters: { ordering: { direction: 'DESC', parameter: undefined } },
          owner: 'Rabee-AbuBaker',
          provider: 'gh',
          pullId: undefined,
          options: {
            staleTime: 300000,
          },
          repo: 'another-test',
        })
      )
    })

    it('returns data', async () => {
      expect(hookData.result.current.data).toEqual({
        headState: 'PROCESSED',
        impactedFiles: [
          {
            changeCoverage: 44.85,
            fileName: 'mafs.js',
            hasHeadOrPatchCoverage: true,
            headCoverage: 90.23,
            headName: 'flag1/mafs.js',
            isCriticalFile: true,
            patchCoverage: 27.43,
          },
        ],
        pullBaseCoverage: 27.35,
        pullHeadCoverage: 74.2,
        pullPatchCoverage: 92.12,
      })
    })
  })
})
