import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { usePull } from 'services/pull'

import { useImpactedFilesTable } from './useImpactedFilesTable'

jest.mock('services/pull')

const mockImpactedFiles = [
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
        changeWithParent: 38.94,
        impactedFiles: mockImpactedFiles,
      },
    },
  },
}

const queryClient = new QueryClient({
  logger: {
    error: () => {},
  },
  defaultOptions: {
    retry: false,
  },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/frumpkin/another-test/pull/14']}>
    <Route path="/:provider/:owner/:repo/pull/:pullid">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('handleSort', () => {
  let hookData
  function setup(pullData = mockPull) {
    usePull.mockReturnValue(pullData)

    hookData = renderHook(() => useImpactedFilesTable({}), { wrapper })
  }

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      setup()
    })

    it('calls useRepoContents with correct filters value', async () => {
      await waitFor(() =>
        expect(usePull).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'DESC', parameter: 'PATCH_COVERAGE_MISSES' },
          },
          owner: 'frumpkin',
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
        hookData.result.current.handleSort([{ desc: false, id: 'change' }])
      })

      await waitFor(() =>
        expect(usePull).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'ASC', parameter: 'CHANGE_COVERAGE' },
          },
          owner: 'frumpkin',
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
})
