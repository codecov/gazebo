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

const mockImpactedFiles = [
  {
    isCriticalFile: true,
    missesCount: 0,
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
    changeCoverage: 41,
  },
]

const mockPull = {
  owner: {
    isCurrentUserPartOfOrg: true,
    repository: {
      __typename: 'Repository',
      defaultBranch: 'main',
      private: false,
      pull: {
        commits: {
          edges: [
            {
              node: {
                state: 'PROCESSED',
                commitid: 'fc43199ccde1f21a940aa3d596c711c1c420651f',
                message:
                  'create component to hold bundle list table for a given pull 2',
                author: {
                  username: 'nicholas-codecov',
                },
              },
            },
          ],
        },
        compareWithBase: {
          state: 'PROCESSED',
          __typename: 'Comparison',
          flagComparisons: [],
          patchTotals: {
            percentCovered: 92.12,
          },
          baseTotals: {
            percentCovered: 27.35,
          },
          headTotals: {
            percentCovered: 74.2,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: mockImpactedFiles,
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
        pullId: 14,
        title: 'feat: Create bundle analysis table for a given pull',
        state: 'OPEN',
        author: {
          username: 'nicholas-codecov',
        },
        head: {
          ciPassed: true,
          branchName:
            'gh-eng-994-create-bundle-analysis-table-for-a-given-pull',
          state: 'PROCESSED',
          commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
          totals: {
            percentCovered: 78.33,
          },
          uploads: {
            totalCount: 4,
          },
        },
        updatestamp: '2024-01-12T12:56:18.912860',
        behindBy: 82367894,
        behindByCommit: '1798hvs8ofhn',
        comparedTo: {
          commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
          uploads: {
            totalCount: 1,
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
  function setup() {
    const variablesPassed = jest.fn()

    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        variablesPassed(req.variables)
        return res(ctx.status(200), ctx.data(mockPull))
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
      setup()
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
        pullId: 5,
        repo: 'test-repo',
      })
    })
  })
})
