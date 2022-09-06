import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useParams } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useImpactedFilesComparison } from 'services/pull'

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

describe('useRepoContentsTable', () => {
  let hookData
  function setup() {
    useParams.mockReturnValue({
      owner: 'Rabee-AbuBaker',
      provider: 'gh',
      repo: 'another-test',
      pull: 14,
    })
    useImpactedFilesComparison.mockReturnValue(mockImpactedFiles)

    hookData = renderHook(() => useImpactedFilesTable({}))
  }

  describe('when handleSort is triggered', () => {
    it('calls useRepoContents with correct filters value', async () => {
      setup()

      act(() => {
        hookData.result.current.handleSort([{ desc: false, id: 'name' }])
      })

      await waitFor(() =>
        expect(useImpactedFilesComparison).toHaveBeenCalledWith({
          filters: { ordering: { direction: 'ASC', parameter: 'FILE_NAME' } },
          owner: 'Rabee-AbuBaker',
          provider: 'gh',
          pullId: undefined,
          repo: 'another-test',
        })
      )

      act(() => {
        hookData.result.current.handleSort([{ desc: true, id: 'coverage' }])
      })

      await waitFor(() =>
        expect(useImpactedFilesComparison).toHaveBeenCalledWith({
          filters: { ordering: { direction: 'DESC', parameter: undefined } },
          owner: 'Rabee-AbuBaker',
          provider: 'gh',
          pullId: undefined,
          repo: 'another-test',
        })
      )
    })
  })
})
