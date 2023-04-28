import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import {
  orderingParameter,
  useImpactedFilesTable,
} from './useImpactedFilesTable'

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
      missesCount: 3,
    },
    patchCoverage: {
      percentCovered: 27.43,
    },
    missesInComparison: 3,
  },
  {
    isCriticalFile: true,
    fileName: 'quarg.js',
    headName: 'flag2/quarg.js',
    baseCoverage: {
      percentCovered: 39,
    },
    headCoverage: {
      percentCovered: 80,
      missesCount: 7,
    },
    patchCoverage: {
      percentCovered: 48.23,
    },
    missesInComparison: 7,
  },
]

let mockPull = {
  owner: {
    repository: {
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

const server = setupServer()
beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/frumpkin/another-test/pull/14']}>
    <Route path="/:provider/:owner/:repo/pull/:pullid">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useImpactedFilesTable', () => {
  const callsHandleSort = jest.fn()
  function setup(dataReturned = mockPull) {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        const { direction, parameter } = req.variables.filters.ordering
        callsHandleSort({ direction, parameter })
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      const { result } = renderHook(() => useImpactedFilesTable(), { wrapper })
      expect(result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      it('returns data', async () => {
        const { result, waitFor } = renderHook(() => useImpactedFilesTable(), {
          wrapper,
        })
        await waitFor(() => !result.current.isLoading)

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
              patchCoverage: 27.43,
              missesInComparison: 3,
              pullId: 14,
            },
            {
              changeCoverage: 41,
              fileName: 'quarg.js',
              hasHeadOrPatchCoverage: true,
              headCoverage: 80,
              headName: 'flag2/quarg.js',
              isCriticalFile: true,
              patchCoverage: 48.23,
              missesInComparison: 7,
              pullId: 14,
            },
          ],
          pullBaseCoverage: 27.35,
          pullHeadCoverage: 74.2,
          pullPatchCoverage: 92.12,
        })
      })
    })
  })

  describe('when when called with no head or base coverage on the changed files', () => {
    beforeEach(() => {
      const mockImpactedFilesWithoutCoverage = [
        {
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
      mockPull.owner.repository.pull.compareWithBase.impactedFiles =
        mockImpactedFilesWithoutCoverage
      setup(mockPull)
    })

    it('returns data', async () => {
      const { result, waitFor } = renderHook(() => useImpactedFilesTable(), {
        wrapper,
      })
      await waitFor(() => !result.current.isLoading)

      expect(result.current.data).toEqual({
        headState: 'PROCESSED',
        impactedFiles: [
          {
            changeCoverage: NaN,
            fileName: 'mafs.js',
            hasHeadOrPatchCoverage: true,
            headCoverage: undefined,
            headName: 'flag1/mafs.js',
            isCriticalFile: true,
            patchCoverage: 27.43,
            pullId: 14,
            missesInComparison: 0,
          },
        ],
        pullBaseCoverage: 27.35,
        pullHeadCoverage: 74.2,
        pullPatchCoverage: 92.12,
      })
    })
  })

  describe('when handleSort is triggered', () => {
    beforeEach(() => {
      setup()
    })

    it('returns data', async () => {
      const { result, waitFor } = renderHook(() => useImpactedFilesTable(), {
        wrapper,
      })
      await waitFor(() => !result.current.isLoading)
      expect(callsHandleSort).toBeCalledTimes(1)
      expect(callsHandleSort).toHaveBeenNthCalledWith(1, {
        direction: 'DESC',
        parameter: orderingParameter.missesInComparison,
      })

      act(() => {
        result.current.handleSort([{ desc: true, id: 'change' }])
      })

      await waitFor(() => !result.current.isLoading)

      // Accounts for both handleSort being called both times during api call
      expect(callsHandleSort).toBeCalledTimes(2)
      expect(callsHandleSort).toHaveBeenNthCalledWith(2, {
        direction: 'DESC',
        parameter: 'CHANGE_COVERAGE',
      })
    })
  })
})
