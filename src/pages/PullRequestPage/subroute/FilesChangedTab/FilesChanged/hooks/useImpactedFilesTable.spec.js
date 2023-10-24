import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
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
    missesCount: 3,
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
    missesCount: 7,
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
          __typename: 'Comparison',
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
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: mockImpactedFiles,
          },
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

const wrapper =
  (initialEntries = ['/gh/frumpkin/another-test/pull/14']) =>
  ({ children }) =>
    (
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullid">
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        </Route>
      </MemoryRouter>
    )

describe('useImpactedFilesTable', () => {
  function setup(dataReturned = mockPull) {
    const callsHandleSort = jest.fn()
    const flagsMock = jest.fn()
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        const { direction, parameter } = req.variables.filters.ordering
        callsHandleSort({ direction, parameter })
        flagsMock(req.variables.filters.flags)
        return res(ctx.status(200), ctx.data(dataReturned))
      })
    )
    return { callsHandleSort, flagsMock }
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('renders isLoading true', () => {
      const { result } = renderHook(() => useImpactedFilesTable(), {
        wrapper: wrapper(),
      })
      expect(result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      it('returns data', async () => {
        const { result } = renderHook(() => useImpactedFilesTable(), {
          wrapper: wrapper(),
        })
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            compareWithBaseType: 'Comparison',
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
                missesCount: 3,
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
                missesCount: 7,
                pullId: 14,
              },
            ],
            impactedFilesType: 'ImpactedFiles',
            pullBaseCoverage: 27.35,
            pullHeadCoverage: 74.2,
            pullPatchCoverage: 92.12,
          })
        )
      })
    })
  })

  describe('when when called with no head or base coverage on the changed files', () => {
    beforeEach(() => {
      const pull = mockPull
      const mockImpactedFilesWithoutCoverage = {
        __typename: 'ImpactedFiles',
        results: [
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
        ],
      }
      pull.owner.repository.pull.compareWithBase.impactedFiles =
        mockImpactedFilesWithoutCoverage
      setup(mockPull)
    })

    it('returns data', async () => {
      const { result } = renderHook(() => useImpactedFilesTable(), {
        wrapper: wrapper(),
      })
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          impactedFilesType: 'ImpactedFiles',
          compareWithBaseType: 'Comparison',
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
              missesCount: 0,
            },
          ],
          pullBaseCoverage: 27.35,
          pullHeadCoverage: 74.2,
          pullPatchCoverage: 92.12,
        })
      )
    })
  })

  describe('when handleSort is triggered', () => {
    it('returns data', async () => {
      const { callsHandleSort } = setup()
      const { result } = renderHook(() => useImpactedFilesTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(callsHandleSort).toBeCalledTimes(1))
      await waitFor(() =>
        expect(callsHandleSort).toHaveBeenNthCalledWith(1, {
          direction: 'DESC',
          parameter: orderingParameter.missesCount,
        })
      )

      act(() => {
        result.current.handleSort([{ desc: true, id: 'change' }])
      })

      await waitFor(() => !result.current.isLoading)

      // Accounts for both handleSort being called both times during api call
      await waitFor(() => expect(callsHandleSort).toBeCalledTimes(2))
      await waitFor(() =>
        expect(callsHandleSort).toHaveBeenNthCalledWith(2, {
          direction: 'DESC',
          parameter: 'CHANGE_COVERAGE',
        })
      )
    })
  })

  describe('sends flags to the API', () => {
    it('correct variables are sent to the api', async () => {
      const { flagsMock } = setup()
      const { result } = renderHook(() => useImpactedFilesTable(), {
        wrapper: wrapper([
          '/gh/frumpkin/another-test/pull/14?flags=flag1,flag2',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(flagsMock).toBeCalledTimes(1))
      await waitFor(() => expect(flagsMock).toHaveBeenCalledWith('flag1,flag2'))
    })
  })
})
