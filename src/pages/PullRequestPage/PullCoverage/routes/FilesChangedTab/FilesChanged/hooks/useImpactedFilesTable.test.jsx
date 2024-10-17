import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { UploadTypeEnum } from 'shared/utils/commit'
import { ImpactedFilesReturnType } from 'shared/utils/impactedFiles'

import {
  orderingParameter,
  useImpactedFilesTable,
} from './useImpactedFilesTable'

const mockImpactedFiles = [
  {
    isCriticalFile: true,
    missesCount: 3,
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
  {
    isCriticalFile: true,
    fileName: 'quarg.js',
    headName: 'flag2/quarg.js',
    baseCoverage: {
      percentCovered: 39,
    },
    headCoverage: {
      percentCovered: 80,
    },
    patchCoverage: {
      percentCovered: 48.23,
    },
    missesCount: 7,
    changeCoverage: 41,
  },
]

const mockPull = ({ overrideComparison } = {}) => ({
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
        compareWithBase: overrideComparison
          ? overrideComparison
          : {
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
          coverageAnalytics: {
            totals: {
              percentCovered: 78.33,
            },
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
                  flags: ['flag7'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['flag7'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['flag7'],
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
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
                },
              },
            ],
          },
        },
      },
    },
  },
})

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
  ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Route path="/:provider/:owner/:repo/pull/:pullid">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Route>
    </MemoryRouter>
  )

describe('useImpactedFilesTable', () => {
  function setup({ overrideComparison } = {}) {
    const callsHandleSort = vi.fn()
    const flagsMock = vi.fn()
    const componentsMock = vi.fn()

    server.use(
      graphql.query('Pull', (info) => {
        const { direction, parameter } = info.variables.filters.ordering
        callsHandleSort({ direction, parameter })
        flagsMock(info.variables.filters.flags)
        componentsMock(info.variables.filters.components)

        return HttpResponse.json({ data: mockPull({ overrideComparison }) })
      })
    )
    return { callsHandleSort, flagsMock, componentsMock }
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
            impactedFilesType: ImpactedFilesReturnType.IMPACTED_FILES,
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
      setup({
        overrideComparison: {
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
            results: [
              {
                isCriticalFile: true,
                missesCount: 0,
                fileName: 'mafs.js',
                headName: 'flag1/mafs.js',
                baseCoverage: {
                  percentCovered: null,
                },
                patchCoverage: {
                  percentCovered: 27.43,
                },
                headCoverage: null,
                changeCoverage: 41,
              },
            ],
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
    })

    it('returns data', async () => {
      const { result } = renderHook(() => useImpactedFilesTable(), {
        wrapper: wrapper(),
      })
      await waitFor(() => !result.current.isLoading)

      await waitFor(() =>
        expect(result.current.data).toEqual({
          impactedFilesType: ImpactedFilesReturnType.IMPACTED_FILES,
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

      await waitFor(() => expect(callsHandleSort).toHaveBeenCalledTimes(1))
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
      await waitFor(() => expect(callsHandleSort).toHaveBeenCalledTimes(2))
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

      await waitFor(() => expect(flagsMock).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(flagsMock).toHaveBeenCalledWith('flag1,flag2'))
    })
  })

  describe('sends components to the API', () => {
    it('correct variables are sent to the api', async () => {
      const { componentsMock } = setup()
      const { result } = renderHook(() => useImpactedFilesTable(), {
        wrapper: wrapper([
          '/gh/frumpkin/another-test/pull/14?components=component1,component2',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(componentsMock).toHaveBeenCalledTimes(1))
      await waitFor(() =>
        expect(componentsMock).toHaveBeenCalledWith('component1,component2')
      )
    })
  })

  describe('sends components and filters to the API', () => {
    it('correct variables are sent to the api', async () => {
      const { componentsMock, flagsMock } = setup()
      const { result } = renderHook(() => useImpactedFilesTable(), {
        wrapper: wrapper([
          '/gh/frumpkin/another-test/pull/14?components=component1,component2&flags=flag1,flag2',
        ]),
      })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(componentsMock).toHaveBeenCalledTimes(1))
      await waitFor(() =>
        expect(componentsMock).toHaveBeenCalledWith('component1,component2')
      )

      await waitFor(() => expect(flagsMock).toHaveBeenCalledTimes(1))
      await waitFor(() => expect(flagsMock).toHaveBeenCalledWith('flag1,flag2'))
    })
  })
})
