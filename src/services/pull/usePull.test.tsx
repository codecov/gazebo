import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { type MockInstance } from 'vitest'

import { usePull } from './usePull'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

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
]

const pull = {
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
                state: 'complete',
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
          state: 'complete',
          __typename: 'Comparison',
          flagComparisons: [],
          patchTotals: {
            percentCovered: 92.12,
          },
          baseTotals: {
            percentCovered: 98.25,
          },
          headTotals: {
            percentCovered: 78.33,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: mockImpactedFiles,
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
        pullId: 2510,
        title: 'feat: Create bundle analysis table for a given pull',
        state: 'OPEN',
        author: {
          username: 'nicholas-codecov',
        },
        head: {
          ciPassed: true,
          branchName:
            'gh-eng-994-create-bundle-analysis-table-for-a-given-pull',
          state: 'complete',
          commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
          coverageAnalytics: {
            totals: {
              percentCovered: 78.33,
            },
          },
          uploads: {
            totalCount: 4,
            edges: [],
          },
        },
        updatestamp: '2024-01-12T12:56:18.912860',
        behindBy: 82367894,
        behindByCommit: '1798hvs8ofhn',
        comparedTo: {
          commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
          uploads: {
            totalCount: 1,
            edges: [],
          },
        },
      },
    },
  },
}

const provider = 'gh'
const owner = 'codecov'
const repo = 'gazebo'

describe('usePull', () => {
  afterEach(() => queryClient.clear())

  function setup(data: {}) {
    server.use(
      graphql.query('Pull', (info) => {
        return HttpResponse.json({ data })
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup(pull)
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () => usePull({ provider, owner, repo, pullId: '2510' }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            defaultBranch: 'main',
            hasAccess: true,
            pull: {
              behindBy: 82367894,
              behindByCommit: '1798hvs8ofhn',
              pullId: 2510,
              title: 'feat: Create bundle analysis table for a given pull',
              state: 'OPEN',
              updatestamp: '2024-01-12T12:56:18.912860',
              author: { username: 'nicholas-codecov' },
              comparedTo: {
                commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
                uploads: { totalCount: 1, edges: [] },
              },
              head: {
                state: 'complete',
                ciPassed: true,
                branchName:
                  'gh-eng-994-create-bundle-analysis-table-for-a-given-pull',
                commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
                coverageAnalytics: {
                  totals: { percentCovered: 78.33 },
                },
                uploads: { totalCount: 4, edges: [] },
              },
              commits: {
                edges: [
                  {
                    node: {
                      state: 'complete',
                      commitid: 'fc43199ccde1f21a940aa3d596c711c1c420651f',
                      message:
                        'create component to hold bundle list table for a given pull 2',
                      author: { username: 'nicholas-codecov' },
                    },
                  },
                ],
              },
              compareWithBase: {
                __typename: 'Comparison',
                state: 'complete',
                patchTotals: { percentCovered: 92.12 },
                baseTotals: { percentCovered: 98.25 },
                headTotals: { percentCovered: 78.33 },
                impactedFiles: {
                  __typename: 'ImpactedFiles',
                  results: [
                    {
                      isCriticalFile: true,
                      missesCount: 3,
                      fileName: 'mafs.js',
                      headName: 'flag1/mafs.js',
                      baseCoverage: { percentCovered: 45.38 },
                      headCoverage: { percentCovered: 90.23 },
                      patchCoverage: { percentCovered: 27.43 },
                      changeCoverage: 41,
                    },
                  ],
                },
                flagComparisons: [],
                changeCoverage: 38.94,
                hasDifferentNumberOfHeadAndBaseReports: true,
              },
            },
          })
        )
      })
    })

    describe('when it is of OwnerNotActivatedError type', () => {
      let consoleSpy: MockInstance
      beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('returns the error', async () => {
        setup({
          owner: {
            isCurrentUserPartOfOrg: false,
            repository: {
              __typename: 'OwnerNotActivatedError',
              message: 'owner not activated',
            },
          },
        })

        const { result } = renderHook(
          () => usePull({ provider, owner, repo, pullId: '2510' }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({ status: 403 })
          )
        )
      })
    })

    describe('when it is of NotFoundError type', () => {
      let consoleSpy: MockInstance
      beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('returns the error', async () => {
        setup({
          owner: {
            isCurrentUserPartOfOrg: false,
            repository: {
              __typename: 'NotFoundError',
              message: 'not found',
            },
          },
        })

        const { result } = renderHook(
          () => usePull({ provider, owner, repo, pullId: '2510' }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({ status: 404, data: {} })
          )
        )
      })
    })

    describe('when there is no pull returned', () => {
      let consoleSpy: MockInstance
      beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('returns pull null', async () => {
        setup({
          owner: {
            isCurrentUserPartOfOrg: true,
            repository: {
              __typename: 'Repository',
              defaultBranch: 'main',
              private: false,
              pull: null,
            },
          },
        })

        const { result } = renderHook(
          () => usePull({ provider, owner, repo, pullId: '2510' }),
          { wrapper }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.data?.pull).toEqual(null))
      })
    })

    describe('when schema is not valid', () => {
      let consoleSpy: MockInstance
      beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('throws an error', async () => {
        setup({
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
                        state: 'complete',
                        commitid: 'fc43199ccde1f21a940aa3d596c711c1c420651f',
                        message:
                          'create component to hold bundle list table for a given pull 2',
                      },
                    },
                  ],
                },
              },
            },
          },
        })

        const { result } = renderHook(
          () => usePull({ provider, owner, repo, pullId: '2510' }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({ status: 404, data: {} })
          )
        )
      })
    })
  })
})
