import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { ImpactedFilesReturnType } from 'shared/utils/impactedFiles'

import { useIndirectChangedFilesTable } from './useIndirectChangedFilesTable'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const mockData = {
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
            __typename: ImpactedFilesReturnType.IMPACTED_FILES,
            results: [
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
            ],
          },
        },
      },
    },
  },
}

const noHeadOrBaseCoverage = {
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
            __typename: ImpactedFilesReturnType.IMPACTED_FILES,
            results: [
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
            ],
          },
        },
      },
    },
  },
}

const server = setupServer()
const wrapper =
  ({ initialEntries = '/gh/test-org/test-repo/pull/5?flags=a,b' } = {}) =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => {
  server.listen()
  console.error = () => {}
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('useIndirectChangedFilesTable', () => {
  function setup(overrideData = mockData) {
    const variablesPassed = jest.fn()

    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        variablesPassed(req.variables)
        return res(ctx.status(200), ctx.data(overrideData))
      })
    )

    return { variablesPassed }
  }

  describe('when handleSort is triggered', () => {
    it('calls useIndirectChangedFilesTable with correct filters value', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useIndirectChangedFilesTable({}), {
        wrapper: wrapper(),
      })

      result.current.handleSort([{ desc: false, id: 'name' }])

      await waitFor(() =>
        expect(variablesPassed).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'DESC', parameter: 'MISSES_COUNT' },
            hasUnintendedChanges: true,
            flags: 'a,b',
          },
          owner: 'test-org',
          provider: 'gh',
          pullId: 5,
          repo: 'test-repo',
        })
      )

      result.current.handleSort([{ desc: true, id: 'coverage' }])

      await waitFor(() =>
        expect(variablesPassed).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'DESC', parameter: undefined },
            hasUnintendedChanges: true,
            flags: 'a,b',
          },
          owner: 'test-org',
          provider: 'gh',
          pullId: 5,
          repo: 'test-repo',
        })
      )
    })
  })

  describe('when called', () => {
    it('returns data', async () => {
      setup()
      const { result } = renderHook(() => useIndirectChangedFilesTable(), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          headState: 'PROCESSED',
          compareWithBaseType: 'Comparison',
          impactedFilesType: ImpactedFilesReturnType.IMPACTED_FILES,
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
              compareWithBaseType: 'Comparison',
              impactedFilesType: ImpactedFilesReturnType.IMPACTED_FILES,
            },
          ],
          pullBaseCoverage: 27.35,
          pullHeadCoverage: 74.2,
          pullPatchCoverage: 92.12,
        })
      )
    })
  })

  describe('when called with no head or base coverage on the impacted files', () => {
    it('returns data', async () => {
      setup(noHeadOrBaseCoverage)
      const { result } = renderHook(() => useIndirectChangedFilesTable({}), {
        wrapper: wrapper(),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          headState: 'PROCESSED',
          compareWithBaseType: 'Comparison',
          impactedFilesType: ImpactedFilesReturnType.IMPACTED_FILES,
          impactedFiles: [
            {
              compareWithBaseType: 'Comparison',
              impactedFilesType: ImpactedFilesReturnType.IMPACTED_FILES,
              changeCoverage: 44.85,
              fileName: 'mafs.js',
              hasHeadOrPatchCoverage: true,
              pullId: 14,
              headCoverage: 90.23,
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
      )
    })
  })

  describe('when called with components', () => {
    it('sends correct api variables', async () => {
      const { variablesPassed } = setup()
      const { result } = renderHook(() => useIndirectChangedFilesTable(), {
        wrapper: wrapper({
          initialEntries: '/gh/test-org/test-repo/pull/5?components=c,d',
        }),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(variablesPassed).toHaveBeenCalledWith({
        filters: {
          ordering: { direction: 'DESC', parameter: 'MISSES_COUNT' },
          hasUnintendedChanges: true,
          components: 'c,d',
        },
        owner: 'test-org',
        provider: 'gh',
        pullId: 5,
        repo: 'test-repo',
      })
    })
  })
})
