import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CompareSummary from './CompareSummary'

const queryClient = new QueryClient()
const server = setupServer()

const createPullData = ({ overrideCommits, overrideComparison } = {}) => {
  const result = {
    owner: {
      isCurrentUserPartOfOrg: true,
      repository: {
        __typename: 'Repository',
        defaultBranch: 'main',
        private: false,
        pull: {
          commits: {
            edges: overrideCommits
              ? overrideCommits
              : [
                  {
                    node: {
                      state: 'complete',
                      commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
                      message:
                        'create component to hold bundle list table for a given pull',
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
                  results: [
                    {
                      fileName: 'usePullBundleComparisonList.tsx',
                      headName:
                        'src/services/pull/usePullBundleComparisonList.tsx',
                      isCriticalFile: false,
                      missesCount: 0,
                      baseCoverage: {
                        percentCovered: 100.0,
                      },
                      headCoverage: {
                        percentCovered: 78.33,
                      },
                      patchCoverage: {
                        percentCovered: 100.0,
                      },
                      changeCoverage: 0.0,
                    },
                    {
                      fileName: 'PullBundleAnalysis.tsx',
                      headName:
                        'src/pages/PullRequestPage/PullBundleAnalysis/PullBundleAnalysis.tsx',
                      isCriticalFile: false,
                      missesCount: 0,
                      baseCoverage: null,
                      headCoverage: {
                        percentCovered: 78.33,
                      },
                      patchCoverage: {
                        percentCovered: 100.0,
                      },
                      changeCoverage: null,
                    },
                    {
                      fileName: 'PullBundleComparisonTable.tsx',
                      headName:
                        'src/pages/PullRequestPage/PullBundleAnalysis/PullBundleComparisonTable/PullBundleComparisonTable.tsx',
                      isCriticalFile: false,
                      missesCount: 0,
                      baseCoverage: null,
                      headCoverage: {
                        percentCovered: 100.0,
                      },
                      patchCoverage: {
                        percentCovered: 100.0,
                      },
                      changeCoverage: null,
                    },
                  ],
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
                    uploadType: 'UPLOADED',
                    flags: ['flag1', 'flag2'],
                  },
                },
                {
                  node: {
                    uploadType: 'CARRIEDFORWARD',
                    flags: ['flag3'],
                  },
                },
                {
                  node: {
                    uploadType: 'UPLOADED',
                    flags: null,
                  },
                },
                {
                  node: {
                    uploadType: 'CARRIEDFORWARD',
                    flags: ['flag4', 'flag5'],
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
                    uploadType: 'UPLOADED',
                    flags: ['flag1', 'flag2'],
                  },
                },
              ],
            },
          },
        },
      },
    },
  }

  return result
}

const wrapper =
  (initialEntries = ['/gh/test-org/test-repo/pull/5']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner/:repo/pull/:pullId">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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

describe('CompareSummary', () => {
  function setup({ pullData }) {
    server.use(
      graphql.query('Pull', () => {
        return HttpResponse.json({ data: pullData })
      })
    )
  }

  describe('Pending or no commits', () => {
    beforeEach(() => {
      setup({
        pullData: createPullData({
          overrideCommits: [
            {
              node: {
                state: 'pending',
                commitid: 'abc',
                message: 'Pending commit',
                author: {
                  username: 'nicholas-codecov',
                },
              },
            },
          ],
        }),
      })
    })

    it('renders a pending card', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const card = await screen.findByText('Why is there no coverage data?')
      expect(card).toBeInTheDocument()
    })
  })

  describe('When there isnt a head and base commit', () => {
    beforeEach(() => {
      setup({
        pullData: {
          owner: {
            isCurrentUserPartOfOrg: false,
            repository: {
              __typename: 'Repository',
              defaultBranch: 'main',
              private: false,
              pull: {
                pullId: 2510,
                title: 'feat: Create bundle analysis table for a given pull',
                state: 'OPEN',
                updatestamp: '2024-01-12T12:56:18.912860',
                author: {
                  username: 'nicholas-codecov',
                },
                behindBy: null,
                behindByCommit: null,
                commits: null,
                head: null,
                comparedTo: null,
                compareWithBase: {
                  __typename: 'MissingComparison',
                  message: 'There is no base commit to compare against',
                },
              },
            },
          },
        },
      })
    })

    it('renders a coverage unknown card', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const card = await screen.findByText('Coverage data is unknown')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Error render', () => {
    beforeEach(() => {
      setup({
        pullData: createPullData({
          overrideCommits: [
            {
              node: {
                state: 'error',
                commitid: 'c42fe217c61b007b2c17544a9d85840381857',
                message: 'There is an error processing the coverage reports',
                author: {
                  username: 'nicholas-codecov',
                },
              },
            },
          ],
        }),
      })
    })

    it('renders a error card', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const card = await screen.findByText(
        /There is an error processing the coverage reports with/i
      )
      expect(card).toBeInTheDocument()

      const baseCommitLink = screen.getByRole('link', {
        name: /2d6c42f/i,
      })
      expect(baseCommitLink).toBeInTheDocument()
      expect(baseCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/2d6c42fe217c61b007b2c17544a9d85840381857'
      )
    })

    it('renders a error card with flags selected', async () => {
      render(<CompareSummary />, {
        wrapper: wrapper(['/gh/test-org/test-repo/pull/5?flags=a,b,c']),
      })

      const card = await screen.findByText(
        /There is an error processing the coverage reports with/i
      )
      expect(card).toBeInTheDocument()

      const baseCommitLink = screen.getByRole('link', {
        name: /2d6c42f/i,
      })
      expect(baseCommitLink).toBeInTheDocument()
      expect(baseCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/2d6c42fe217c61b007b2c17544a9d85840381857?flags=a%2Cb%2Cc'
      )
    })
  })

  describe('Successful render', () => {
    beforeEach(() => {
      setup({ pullData: createPullData() })
    })

    it('renders a card for every valid field', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const headCardTitle = await screen.findByText('HEAD')
      expect(headCardTitle).toBeInTheDocument()
      const headCardValue = await screen.findByText('78.33%')
      expect(headCardValue).toBeInTheDocument()

      const patchCardTitle = await screen.findByText('Patch')
      expect(patchCardTitle).toBeInTheDocument()
      const patchCardValue = await screen.findByText('92.12%')
      expect(patchCardValue).toBeInTheDocument()

      const changeCardTitle = await screen.findByText('Change')
      expect(changeCardTitle).toBeInTheDocument()
      const changeCardValue = await screen.findByText('38.94%')
      expect(changeCardValue).toBeInTheDocument()
      expect(changeCardValue).toHaveClass("before:content-['+']")

      const sourceCardTitle = await screen.findByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()
      const coverageBasedOnText = await screen.findByText(
        /Coverage data is based on/i
      )
      expect(coverageBasedOnText).toBeInTheDocument()

      const headCommitIds = await screen.findAllByText('fc43199')
      expect(headCommitIds).toHaveLength(2)

      const headCommitLink = screen.getByRole('link', {
        name: /fc43199/i,
      })
      expect(headCommitLink).toBeInTheDocument()
      expect(headCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/fc43199b07c52cf3d6c19b7cdb368f74387c38ab'
      )

      const baseCommitLink = screen.getByRole('link', {
        name: /2d6c42f/i,
      })
      expect(baseCommitLink).toBeInTheDocument()
      expect(baseCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/2d6c42fe217c61b007b2c17544a9d85840381857'
      )
    })

    it('renders a card for every valid field with flags', async () => {
      render(<CompareSummary />, {
        wrapper: wrapper(['/gh/test-org/test-repo/pull/5?flags=a,b,c']),
      })
      const headCardTitle = await screen.findByText('HEAD')
      expect(headCardTitle).toBeInTheDocument()
      const headCardValue = await screen.findByText('78.33%')
      expect(headCardValue).toBeInTheDocument()

      const patchCardTitle = await screen.findByText('Patch')
      expect(patchCardTitle).toBeInTheDocument()
      const patchCardValue = await screen.findByText('92.12%')
      expect(patchCardValue).toBeInTheDocument()

      const changeCardTitle = await screen.findByText('Change')
      expect(changeCardTitle).toBeInTheDocument()
      const changeCardValue = await screen.findByText('38.94%')
      expect(changeCardValue).toBeInTheDocument()
      expect(changeCardValue).toHaveClass("before:content-['+']")

      const sourceCardTitle = await screen.findByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()
      const coverageBasedOnText = await screen.findByText(
        /Coverage data is based on/i
      )
      expect(coverageBasedOnText).toBeInTheDocument()

      const headCommitIds = await screen.findAllByText('fc43199')
      expect(headCommitIds).toHaveLength(2)

      const headCommitLink = screen.getByRole('link', {
        name: /fc43199/i,
      })
      expect(headCommitLink).toBeInTheDocument()
      expect(headCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/fc43199b07c52cf3d6c19b7cdb368f74387c38ab?flags=a%2Cb%2Cc'
      )

      const baseCommitLink = screen.getByRole('link', {
        name: /2d6c42f/i,
      })
      expect(baseCommitLink).toBeInTheDocument()
      expect(baseCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/2d6c42fe217c61b007b2c17544a9d85840381857?flags=a%2Cb%2Cc'
      )
    })

    it('renders a card with the behind by information', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const baseCommitText = await screen.findByText(/BASE commit is/)
      expect(baseCommitText).toBeInTheDocument()

      const behindByNumber = await screen.findByText(/82367894/)
      expect(behindByNumber).toBeInTheDocument()

      const headBehindBy = await screen.findByText(/commits behind HEAD on/)
      expect(headBehindBy).toBeInTheDocument()

      const behindByCommitLink = screen.getByRole('link', {
        name: /1798hvs/i,
      })
      expect(behindByCommitLink).toBeInTheDocument()
      expect(behindByCommitLink).toHaveAttribute(
        'href',
        'https://github.com/test-org/test-repo/commit/1798hvs8ofhn'
      )
    })
  })

  describe('When base and head have same number of reports', () => {
    beforeEach(() => {
      setup({
        pullData: createPullData({
          overrideComparison: {
            ...createPullData().owner.repository.pull.compareWithBase,
            hasDifferentNumberOfHeadAndBaseReports: false,
          },
        }),
      })
    })

    it('renders card CardWithSameNumberOfUploads', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const sourceCardTitle = await screen.findByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()

      const coverageBasedOnText = await screen.findByText(
        /Coverage data is based on/i
      )
      expect(coverageBasedOnText).toBeInTheDocument()

      const headCommitIds = await screen.findAllByText('fc43199')
      expect(headCommitIds).toHaveLength(2)

      const headCommitLink = screen.getByRole('link', {
        name: /fc43199/i,
      })
      expect(headCommitLink).toBeInTheDocument()
      expect(headCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/fc43199b07c52cf3d6c19b7cdb368f74387c38ab'
      )

      const baseCommitLink = screen.getByRole('link', {
        name: /2d6c42f/i,
      })
      expect(baseCommitLink).toBeInTheDocument()
      expect(baseCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/2d6c42fe217c61b007b2c17544a9d85840381857'
      )
    })
  })

  describe('When base and head have different number of reports', () => {
    beforeEach(() => {
      setup({
        pullData: createPullData(),
      })
    })

    it('renders a card for every valid field', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const sourceCardTitle = await screen.findByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()

      const differentUploadsText = await screen.findByText(
        /Commits have different number of coverage report uploads/i
      )
      expect(differentUploadsText).toBeInTheDocument()
      const learnMore = screen.getByRole('link', {
        name: /learn more/i,
      })
      expect(learnMore).toBeInTheDocument()
      expect(learnMore).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/unexpected-coverage-changes#mismatching-base-and-head-commit-upload-counts'
      )
      expect(await screen.findByText(/(4 uploads)/i)).toBeInTheDocument()
      expect(await screen.findByText(/(1 uploads)/i)).toBeInTheDocument()

      const headCommitLink = screen.getByRole('link', {
        name: /fc43199/i,
      })
      expect(headCommitLink).toBeInTheDocument()
      expect(headCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/fc43199b07c52cf3d6c19b7cdb368f74387c38ab'
      )

      const baseCommitLink = screen.getByRole('link', {
        name: /2d6c42f/i,
      })
      expect(baseCommitLink).toBeInTheDocument()
      expect(baseCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/2d6c42fe217c61b007b2c17544a9d85840381857'
      )
    })

    it('renders a card for every valid field with flags', async () => {
      render(<CompareSummary />, {
        wrapper: wrapper(['/gh/test-org/test-repo/pull/5?flags=a,b,c']),
      })
      const sourceCardTitle = await screen.findByText('Source')
      expect(sourceCardTitle).toBeInTheDocument()

      const differentUploadsText = await screen.findByText(
        /Commits have different number of coverage report uploads/i
      )
      expect(differentUploadsText).toBeInTheDocument()
      const learnMore = screen.getByRole('link', {
        name: /learn more/i,
      })
      expect(learnMore).toBeInTheDocument()
      expect(learnMore).toHaveAttribute(
        'href',
        'https://docs.codecov.com/docs/unexpected-coverage-changes#mismatching-base-and-head-commit-upload-counts'
      )
      expect(await screen.findByText(/(4 uploads)/i)).toBeInTheDocument()
      expect(await screen.findByText(/(1 uploads)/i)).toBeInTheDocument()

      const headCommitLink = screen.getByRole('link', {
        name: /fc43199/i,
      })
      expect(headCommitLink).toBeInTheDocument()
      expect(headCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/fc43199b07c52cf3d6c19b7cdb368f74387c38ab?flags=a%2Cb%2Cc'
      )

      const baseCommitLink = screen.getByRole('link', {
        name: /2d6c42f/i,
      })
      expect(baseCommitLink).toBeInTheDocument()
      expect(baseCommitLink).toHaveAttribute(
        'href',
        '/gh/test-org/test-repo/commit/2d6c42fe217c61b007b2c17544a9d85840381857?flags=a%2Cb%2Cc'
      )
    })
  })

  describe('When PR is behind by the target branch', () => {
    beforeEach(() => {
      setup({
        pullData: createPullData(),
      })
    })

    it('renders a card with the behind by information', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const baseCommitText = await screen.findByText(/BASE commit is/)
      expect(baseCommitText).toBeInTheDocument()

      const behindByNumber = await screen.findByText(/82367894/)
      expect(behindByNumber).toBeInTheDocument()

      const headBehindBy = await screen.findByText(/commits behind HEAD on/)
      expect(headBehindBy).toBeInTheDocument()

      const behindByCommitLink = screen.getByRole('link', {
        name: /1798hvs/i,
      })
      expect(behindByCommitLink).toBeInTheDocument()
      expect(behindByCommitLink).toHaveAttribute(
        'href',
        'https://github.com/test-org/test-repo/commit/1798hvs8ofhn'
      )
    })
  })

  describe('When PR is not behind by the target branch', () => {
    it('does not render a card with the behind by information', async () => {
      setup({
        pullData: createPullData(),
      })

      render(<CompareSummary />, { wrapper: wrapper() })

      const baseCommitText = screen.queryByText(/BASE commit is/)
      expect(baseCommitText).not.toBeInTheDocument()

      const behindByNumber = screen.queryByText(/0/)
      expect(behindByNumber).not.toBeInTheDocument()
    })
  })
})
