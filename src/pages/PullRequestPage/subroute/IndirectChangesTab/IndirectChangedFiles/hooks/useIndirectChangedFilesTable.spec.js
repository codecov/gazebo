import { renderHook, waitFor } from '@testing-library/react'
import { useParams } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { usePull } from 'services/pull'

import { useIndirectChangedFilesTable } from './useIndirectChangedFilesTable'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(() => {}),
}))
jest.mock('services/pull')

const mockImpactedFiles = [
  {
    missesCount: 0,
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
]

let mockPull = {
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
        changeCoverage: 38.94,
        impactedFiles: mockImpactedFiles,
      },
    },
  },
}

describe('useRepoContentsTable', () => {
  function setup(pullData = mockPull) {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      pull: 14,
    })
    usePull.mockReturnValue(pullData)
  }

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      setup()
    })

    it('calls useRepoContents with correct filters value', async () => {
      const { result } = renderHook(() => useIndirectChangedFilesTable({}))

      act(() => {
        result.current.handleSort([{ desc: false, id: 'name' }])
      })

      await waitFor(() =>
        expect(usePull).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'DESC', parameter: 'MISSES_COUNT' },
            hasUnintendedChanges: true,
          },
          owner: 'Rabee-AbuBaker',
          options: {
            staleTime: 300000,
            suspense: false,
          },
          provider: 'gh',
          pullId: undefined,
          repo: 'another-test',
        })
      )

      act(() => {
        result.current.handleSort([{ desc: true, id: 'coverage' }])
      })

      await waitFor(() =>
        expect(usePull).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'DESC', parameter: undefined },
            hasUnintendedChanges: true,
          },
          owner: 'Rabee-AbuBaker',
          provider: 'gh',
          pullId: undefined,
          options: {
            staleTime: 300000,
            suspense: false,
          },
          repo: 'another-test',
        })
      )
    })
  })

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data', async () => {
      const { result } = renderHook(() => useIndirectChangedFilesTable({}))

      expect(result.current.data).toEqual({
        headState: 'PROCESSED',
        impactedFiles: [
          {
            changeCoverage: 44.85,
            fileName: 'mafs.js',
            hasHeadOrPatchCoverage: true,
            headCoverage: 90.23,
            headName: 'flag1/mafs.js',
            isCriticalFile: true,
            missesCount: 0,
            patchCoverage: 27.43,
            pullId: 14,
          },
        ],
        pullBaseCoverage: 27.35,
        pullHeadCoverage: 74.2,
        pullPatchCoverage: 92.12,
      })
    })
  })

  describe('when called with no head or base coverage on the impacted files', () => {
    beforeEach(() => {
      const mockImpactedFilesWithoutCoverage = [
        {
          missesCount: 0,
          isCriticalFile: true,
          fileName: 'mafs.js',
          headName: 'flag1/mafs.js',
          baseCoverage: {
            percentCovered: undefined,
          },
          headCoverage: {
            percentCovered: undefined,
          },
          patchCoverage: {
            percentCovered: 27.43,
          },
        },
      ]
      mockPull.data.pull.compareWithBase.impactedFiles =
        mockImpactedFilesWithoutCoverage
      setup(mockPull)
    })

    it('returns data', async () => {
      const { result } = renderHook(() => useIndirectChangedFilesTable({}))

      expect(result.current.data).toEqual({
        headState: 'PROCESSED',
        impactedFiles: [
          {
            changeCoverage: NaN,
            fileName: 'mafs.js',
            hasHeadOrPatchCoverage: true,
            pullId: 14,
            headCoverage: undefined,
            headName: 'flag1/mafs.js',
            isCriticalFile: true,
            missesCount: 0,
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
