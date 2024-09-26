import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import qs from 'qs'
import { MemoryRouter, Route } from 'react-router-dom'

import { UploadTypeEnum } from 'shared/utils/commit'
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
            edges: [
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: null,
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag4', 'flag5'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['flag6'],
                },
              },
            ],
          },
        },
        updatestamp: '2024-01-12T12:56:18.912860',
        behindBy: 82367894,
        behindByCommit: '1798hvs8ofhn',
        comparedTo: {
          commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
          uploads: {
            totalCount: 1,
            edges: [
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['flag7'],
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
  (
    initialEntries = '/gh/test-org/test-repo/pull/5?flags=a,b'
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
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
    const variablesPassed = vi.fn()

    server.use(
      graphql.query('Pull', (info) => {
        variablesPassed(info.variables)
        return HttpResponse.json({ data: mockPull })
      })
    )

    return { variablesPassed }
  }

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

  describe('when called with flags and components', () => {
    it('sends correct api variables', async () => {
      const { variablesPassed } = setup()
      const path = `/gh/test-org/test-repo/pull/5${qs.stringify(
        { flags: ['flag-1'], components: ['component-1'] },
        { addQueryPrefix: true }
      )}`

      renderHook(() => useIndirectChangedFilesTable(), {
        wrapper: wrapper(path),
      })

      await waitFor(() =>
        expect(variablesPassed).toHaveBeenCalledWith({
          filters: {
            ordering: { direction: 'DESC', parameter: 'MISSES_COUNT' },
            hasUnintendedChanges: true,
            components: ['component-1'],
            flags: ['flag-1'],
          },
          owner: 'test-org',
          pullId: 5,
          repo: 'test-repo',
        })
      )
    })
  })
})
