import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { CommitStateEnum, UploadTypeEnum } from 'shared/utils/commit'
import { ComparisonReturnType } from 'shared/utils/comparison'
import { ImpactedFilesReturnType } from 'shared/utils/impactedFiles'

import FilesChanged from './FilesChanged'

vi.mock('./FilesChangedTable', () => ({ default: () => 'Files Changed Table' }))

const mockImpactedFiles = [
  {
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
    missesCount: 0,

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
    changeCoverage: 41,
  },
]

const mockPull = ({ overrideComparison, headState } = {}) => ({
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
              __typename: ComparisonReturnType.SUCCESSFUL_COMPARISON,
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
          state: headState ? headState : 'complete',
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
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['unit'],
                },
              },
              {
                node: {
                  uploadType: UploadTypeEnum.CARRIED_FORWARD,
                  flags: ['integration'],
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
                  uploadType: UploadTypeEnum.UPLOADED,
                  flags: ['unit'],
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
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('FilesChanged', () => {
  function setup({ overrideComparison, headState } = {}) {
    server.use(
      graphql.query('Pull', () => {
        return HttpResponse.json({
          data: mockPull({ overrideComparison, headState }),
        })
      })
    )
  }

  describe('when rendered with changed files', () => {
    beforeEach(() => {
      setup()
    })

    it('renders changed files component', async () => {
      render(<FilesChanged />, { wrapper })

      const filesChangedTable = await screen.findByText(/Files Changed Table/)
      expect(filesChangedTable).toBeInTheDocument()
    })
  })

  describe('when rendered without changes', () => {
    beforeEach(() => {
      setup({
        overrideComparison: {
          state: 'complete',
          __typename: ComparisonReturnType.SUCCESSFUL_COMPARISON,
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
    })

    it('renders no change text', async () => {
      render(<FilesChanged />, { wrapper })

      const noChangesText = await screen.findByText(
        'Everything is accounted for! No changes detected that need to be reviewed.'
      )
      expect(noChangesText).toBeInTheDocument()

      const body = await screen.findByText(
        'Lines, not adjusted in diff, that have changed coverage data.'
      )
      expect(body).toBeInTheDocument()

      expect(
        screen.queryByText('ImpactedFiles Component')
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendered without changed files or changes', () => {
    beforeEach(() => {
      setup({
        overrideComparison: {
          __typename: ComparisonReturnType.MISSING_COMPARISON,
          message: 'No head commit found',
        },
      })
    })

    it('renders no changed files text', async () => {
      render(<FilesChanged />, { wrapper })

      const warning = await screen.findByText(
        'No Files covered by tests were changed'
      )

      expect(warning).toBeInTheDocument()
      expect(
        screen.queryByText('ImpactedFiles Component')
      ).not.toBeInTheDocument()
    })
  })

  describe('when rendered with head commit errored out', () => {
    beforeEach(() => {
      setup({ headState: CommitStateEnum.ERROR })
    })

    it('renders no head commit error text', async () => {
      render(<FilesChanged />, { wrapper })

      const error = await screen.findByText(
        'Cannot display changed files because most recent commit is in an error state.'
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when rendered for first pull request', () => {
    it('renders first pull request copy', async () => {
      setup({
        overrideComparison: {
          __typename: ComparisonReturnType.FIRST_PULL_REQUEST,
          message: 'First pull request',
        },
      })
      render(<FilesChanged />, { wrapper })

      const firstPullRequestCopy = await screen.findByText(
        /No comparison made since it's your first commit with Codecov/
      )
      expect(firstPullRequestCopy).toBeInTheDocument()
    })
  })

  describe('unknown flag status', () => {
    it('Displays server message + suggests carryforward flags', async () => {
      const overrideComparison = {
        state: 'complete',
        __typename: ComparisonReturnType.SUCCESSFUL_COMPARISON,
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
          __typename: ImpactedFilesReturnType.UNKNOWN_FLAGS,
          message: 'Unkown flags detected',
        },
        changeCoverage: 38.94,
        hasDifferentNumberOfHeadAndBaseReports: true,
      }

      setup({
        overrideComparison,
      })
      render(<FilesChanged />, { wrapper })

      const serverMessage = await screen.findByText(
        /No coverage report uploaded for the selected flags in this pull request's head commit./
      )
      expect(serverMessage).toBeInTheDocument()
    })
  })
})
