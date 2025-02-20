import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { PullComparison } from 'services/pull'
import { OrderingDirection, OrderingParameter } from 'services/pull/usePull'
import { UploadTypeEnum } from 'shared/utils/commit'

import FilesChangedTable, { getFilter } from './FilesChangedTable'

vi.mock('../PullFileDiff', () => ({ default: () => 'PullFileDiff' }))

const mockImpactedFiles = [
  {
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

const mockPull = ({
  overrideComparison,
}: {
  overrideComparison?: PullComparison
}) => ({
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
        compareWithBase: overrideComparison
          ? overrideComparison
          : {
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
            edges: [
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['flag3'],
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

const server = setupServer()

const wrapper =
  (
    queryClient: QueryClient,
    initialEntries = ['/gh/codecov/test-repo/pull/s2h5a6']
  ): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pull">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

describe('FilesChangedTable', () => {
  function setup({
    overrideComparison,
  }: { overrideComparison?: PullComparison } = {}) {
    const user = userEvent.setup()
    const mockVars = vi.fn()

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })

    server.use(
      graphql.query('Pull', (info) => {
        mockVars(info.variables?.filters)

        return HttpResponse.json({ data: mockPull({ overrideComparison }) })
      })
    )

    return { user, mockVars, queryClient }
  }

  describe('renders header', () => {
    it('renders name column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Name')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders missed lines column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Missed lines')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders patch % column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Patch %')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders change column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Change %')
      expect(nameHeader).toBeInTheDocument()
    })

    it('renders coverage on head column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const nameHeader = await screen.findByText('Head %')
      expect(nameHeader).toBeInTheDocument()
    })
  })

  describe('renders data rows', () => {
    it('renders name column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const path = await screen.findByText('flag1/mafs.js')
      expect(path).toBeInTheDocument()
    })

    it('renders missed lines column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const missesCount = await screen.findByText('0')
      expect(missesCount).toBeInTheDocument()
    })

    it('renders patch % column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const path = await screen.findByText('27.43%')
      expect(path).toBeInTheDocument()
    })

    it('renders change column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const change = await screen.findByText('44.85%')
      expect(change).toBeInTheDocument()
    })

    it('renders coverage on head column', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const headCoverage = await screen.findByText('90.23%')
      expect(headCoverage).toBeInTheDocument()
    })

    it('renders - for missing headCoverage', async () => {
      const { queryClient } = setup({
        overrideComparison: {
          state: 'complete',
          __typename: 'Comparison',
          flagComparisons: [],
          patchTotals: {
            percentCovered: 92.12,
          },
          baseTotals: {
            percentCovered: 98.25,
          },
          headTotals: null,
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                missesCount: 0,
                fileName: 'src/App.tsx',
                headName: 'flag1/src/App.tsx',
                baseCoverage: null,
                headCoverage: {
                  percentCovered: 90.23,
                },
                patchCoverage: {
                  percentCovered: 27.43,
                },
                changeCoverage: 41,
              },
            ],
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const baseCoverage = await screen.findByText('-')
      expect(baseCoverage).toBeInTheDocument()
    })
  })

  describe('when comparison is on pending state', () => {
    it('renders spinner', async () => {
      const { queryClient } = setup({
        overrideComparison: {
          state: 'pending',
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
            results: [],
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      await waitFor(() => expect(queryClient.isFetching()).toBeGreaterThan(0))
      await waitFor(() => expect(queryClient.isFetching()).toBe(0))

      const spinner = await screen.findByTestId('spinner')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('no files were changed', () => {
    it('renders no file covered message', async () => {
      const { queryClient } = setup({
        overrideComparison: {
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
            results: [],
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const noFiles = await screen.findByText(
        'No files covered by tests were changed'
      )
      expect(noFiles).toBeInTheDocument()
    })
  })

  describe('expanding file diffs', () => {
    it('renders pull file diff', async () => {
      const { queryClient, user } = setup()
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      expect(await screen.findByTestId('file-diff-expand')).toBeTruthy()
      const expander = screen.getByTestId('file-diff-expand')
      expect(expander).toBeInTheDocument()
      await user.click(expander)

      const pullFileDiff = await screen.findByText('PullFileDiff')
      expect(pullFileDiff).toBeInTheDocument()
    })

    it('auto expands if param is passed in url', async () => {
      const { queryClient } = setup()
      render(<FilesChangedTable />, {
        wrapper: wrapper(queryClient, [
          '/gh/codecov/test-repo/pull/s2h5a6?filepath=flag1/mafs.js',
        ]),
      })

      const pullFileDiff = await screen.findByText('PullFileDiff')
      expect(pullFileDiff).toBeInTheDocument()
    })
  })

  describe('highlights deleted files', () => {
    it('renders non-deleted file', async () => {
      const { queryClient } = setup({})
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const deletedFile = screen.queryByText('Deleted file')
      expect(deletedFile).not.toBeInTheDocument()
    })

    it('renders deleted file', async () => {
      const { queryClient } = setup({
        overrideComparison: {
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
            results: [
              {
                missesCount: 0,
                fileName: 'src/App.tsx',
                headName: 'flag1/src/App.tsx',
                baseCoverage: {
                  percentCovered: 45.38,
                },
                headCoverage: null,
                patchCoverage: null,
                changeCoverage: null,
              },
            ],
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const file = await screen.findByText('flag1/src/App.tsx')
      expect(file).toBeInTheDocument()

      const deletedFile = await screen.findByText('Deleted file')
      expect(deletedFile).toBeInTheDocument()
    })
  })

  describe('patch coverage renderer', () => {
    it('renders dash for missing patch coverage', async () => {
      const { queryClient } = setup({
        overrideComparison: {
          state: 'complete',
          __typename: 'Comparison',
          flagComparisons: [],
          patchTotals: null,
          baseTotals: {
            percentCovered: 98.25,
          },
          headTotals: {
            percentCovered: 78.33,
          },
          impactedFiles: {
            __typename: 'ImpactedFiles',
            results: [
              {
                missesCount: 0,
                fileName: 'src/App.tsx',
                headName: 'flag1/src/App.tsx',
                baseCoverage: {
                  percentCovered: 45.38,
                },
                headCoverage: {
                  percentCovered: 90.23,
                },
                patchCoverage: null,
                changeCoverage: 41,
              },
            ],
          },
          changeCoverage: 38.94,
          hasDifferentNumberOfHeadAndBaseReports: true,
        },
      })
      render(<FilesChangedTable />, { wrapper: wrapper(queryClient) })

      const noChange = await screen.findByText('-')
      expect(noChange).toBeInTheDocument()
    })
  })

  describe('getFilter', () => {
    describe('passed array is empty', () => {
      it('returns undefined', () => {
        const data = getFilter([])

        expect(data).toBeUndefined()
      })
    })

    describe('id is name', () => {
      describe('desc is true', () => {
        it('returns id name, desc direction', () => {
          const data = getFilter([{ id: 'name', desc: true }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.desc,
            parameter: OrderingParameter.FILE_NAME,
          })
        })
      })

      describe('desc is false', () => {
        it('returns id name, asc direction', () => {
          const data = getFilter([{ id: 'name', desc: false }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.asc,
            parameter: OrderingParameter.FILE_NAME,
          })
        })
      })
    })

    describe('id is missedLines', () => {
      describe('desc is true', () => {
        it('returns id missed lines, desc direction', () => {
          const data = getFilter([{ id: 'missedLines', desc: true }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.desc,
            parameter: OrderingParameter.MISSES_COUNT,
          })
        })
      })

      describe('desc is false', () => {
        it('returns id missed lines, asc direction', () => {
          const data = getFilter([{ id: 'missedLines', desc: false }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.asc,
            parameter: OrderingParameter.MISSES_COUNT,
          })
        })
      })
    })

    describe('id is changePercentage', () => {
      describe('desc is true', () => {
        it('returns id change percentage, desc direction', () => {
          const data = getFilter([{ id: 'change', desc: true }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.desc,
            parameter: OrderingParameter.CHANGE_COVERAGE,
          })
        })
      })

      describe('desc is false', () => {
        it('returns id change percentage, asc direction', () => {
          const data = getFilter([{ id: 'change', desc: false }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.asc,
            parameter: OrderingParameter.CHANGE_COVERAGE,
          })
        })
      })
    })

    describe('id is patchPercentage', () => {
      describe('desc is true', () => {
        it('returns id patchPercentage, desc direction', () => {
          const data = getFilter([{ id: 'patchPercentage', desc: true }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.desc,
            parameter: OrderingParameter.PATCH_COVERAGE,
          })
        })
      })

      describe('desc is false', () => {
        it('returns id patch percentage, asc direction', () => {
          const data = getFilter([{ id: 'name', desc: false }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.asc,
            parameter: OrderingParameter.FILE_NAME,
          })
        })
      })
    })

    describe('id is head coverage', () => {
      describe('desc is true', () => {
        it('returns id head coverage, desc direction', () => {
          const data = getFilter([{ id: 'head', desc: true }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.desc,
            parameter: OrderingParameter.HEAD_COVERAGE,
          })
        })
      })

      describe('desc is false', () => {
        it('returns id head coverage, asc direction', () => {
          const data = getFilter([{ id: 'head', desc: false }])

          expect(data).toStrictEqual({
            direction: OrderingDirection.asc,
            parameter: OrderingParameter.HEAD_COVERAGE,
          })
        })
      })
    })
  })
})
