import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { usePull, useSingularImpactedFileComparison } from './index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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
          totals: {
            percentCovered: 78.33,
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

  function setup(data) {
    server.use(
      graphql.query('Pull', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
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
          () => usePull({ provider, owner, repo }),
          {
            wrapper,
          }
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
                totals: { percentCovered: 78.33 },
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
          () => usePull({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.error.status).toEqual(403))
      })
    })

    describe('when it is of NotFoundError type', () => {
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
          () => usePull({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.error.status).toEqual(404))
      })
    })

    describe('when there is no pull returned', () => {
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
          () => usePull({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.data.pull).toEqual(null))
      })
    })

    describe('when schema is not valid', () => {
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
          () => usePull({ provider, owner, repo }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.error.status).toEqual(404))
      })
    })
  })
})

const mockSingularImpactedFilesData = {
  headName: 'file A',
  hashedPath: 'hashedFilePath',
  isRenamedFile: false,
  isDeletedFile: false,
  isCriticalFile: false,
  isNewFile: true,
  headCoverage: {
    percentCovered: 90.23,
  },
  baseCoverage: {
    percentCovered: 23.42,
  },
  patchCoverage: {
    percentCovered: 27.43,
  },
  changeCoverage: 58.333333333333336,
  segments: {
    __typename: 'SegmentComparisons',
    results: [
      {
        header: '@@ -0,0 +1,45 @@',
        hasUnintendedChanges: false,
        lines: [
          {
            baseNumber: null,
            headNumber: '1',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+export default class Calculator {',
          },
          {
            baseNumber: null,
            headNumber: '2',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private value = 0;',
          },
          {
            baseNumber: null,
            headNumber: '3',
            baseCoverage: null,
            headCoverage: 'H',
            content: '+  private calcMode = ""',
          },
        ],
      },
    ],
  },
}

describe('useSingularImpactedFileComparison', () => {
  afterEach(() => queryClient.clear())

  function setup(data) {
    server.use(
      graphql.query('ImpactedFileComparison', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(data))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            __typename: 'Repository',
            pull: {
              compareWithBase: {
                __typename: 'Comparison',
                impactedFile: mockSingularImpactedFilesData,
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: 'New',
            hashedPath: 'hashedFilePath',
            headName: 'file A',
            isCriticalFile: false,
            segments: [
              {
                hasUnintendedChanges: false,
                header: '@@ -0,0 +1,45 @@',
                lines: [
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+export default class Calculator {',
                    headCoverage: 'H',
                    headNumber: '1',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private value = 0;',
                    headCoverage: 'H',
                    headNumber: '2',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private calcMode = ""',
                    headCoverage: 'H',
                    headNumber: '3',
                  },
                ],
              },
            ],
          })
        )
      })
    })
  })

  describe('when called with renamed file', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            __typename: 'Repository',
            pull: {
              compareWithBase: {
                __typename: 'Comparison',
                impactedFile: {
                  ...mockSingularImpactedFilesData,
                  isRenamedFile: true,
                  isNewFile: false,
                },
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: 'Renamed',
            headName: 'file A',
            isCriticalFile: false,
            hashedPath: 'hashedFilePath',
            segments: [
              {
                hasUnintendedChanges: false,
                header: '@@ -0,0 +1,45 @@',
                lines: [
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+export default class Calculator {',
                    headCoverage: 'H',
                    headNumber: '1',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private value = 0;',
                    headCoverage: 'H',
                    headNumber: '2',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private calcMode = ""',
                    headCoverage: 'H',
                    headNumber: '3',
                  },
                ],
              },
            ],
          })
        )
      })
    })
  })

  describe('when called with deleted file', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            __typename: 'Repository',
            pull: {
              compareWithBase: {
                __typename: 'Comparison',
                impactedFile: {
                  ...mockSingularImpactedFilesData,
                  isDeletedFile: true,
                },
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: 'New',
            headName: 'file A',
            isCriticalFile: false,
            hashedPath: 'hashedFilePath',
            segments: [
              {
                hasUnintendedChanges: false,
                header: '@@ -0,0 +1,45 @@',
                lines: [
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+export default class Calculator {',
                    headCoverage: 'H',
                    headNumber: '1',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private value = 0;',
                    headCoverage: 'H',
                    headNumber: '2',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private calcMode = ""',
                    headCoverage: 'H',
                    headNumber: '3',
                  },
                ],
              },
            ],
          })
        )
      })
    })
  })

  describe('when called with an unchanged file label', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            __typename: 'Repository',
            pull: {
              compareWithBase: {
                __typename: 'Comparison',
                impactedFile: {
                  ...mockSingularImpactedFilesData,
                  isNewFile: false,
                  isRenamedFile: false,
                  isDeletedFile: false,
                },
              },
            },
          },
        },
      })
    })

    describe('when data is loaded', () => {
      it('returns the data', async () => {
        const { result } = renderHook(
          () =>
            useSingularImpactedFileComparison({
              provider,
              owner,
              repo,
              pullId: 10,
              path: 'someFile.js',
            }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            fileLabel: null,
            headName: 'file A',
            isCriticalFile: false,
            hashedPath: 'hashedFilePath',
            segments: [
              {
                hasUnintendedChanges: false,
                header: '@@ -0,0 +1,45 @@',
                lines: [
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+export default class Calculator {',
                    headCoverage: 'H',
                    headNumber: '1',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private value = 0;',
                    headCoverage: 'H',
                    headNumber: '2',
                  },
                  {
                    baseCoverage: null,
                    baseNumber: null,
                    content: '+  private calcMode = ""',
                    headCoverage: 'H',
                    headNumber: '3',
                  },
                ],
              },
            ],
          })
        )
      })
    })
  })
})
