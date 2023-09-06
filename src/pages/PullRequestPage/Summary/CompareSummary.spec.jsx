import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import CompareSummary from './CompareSummary'

const queryClient = new QueryClient()
const server = setupServer()

const wrapper =
  (initialEntries = ['/gh/test-org/test-repo/pull/5']) =>
  ({ children }) =>
    (
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
  function setup(pullData) {
    server.use(
      graphql.query('Pull', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(pullData))
      )
    )
  }

  describe('Pending or no commits', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            pull: {
              head: {
                totals: {
                  coverage: undefined,
                },
              },
              comparedTo: {
                totals: {
                  coverage: undefined,
                },
              },
              compareWithBase: {
                patchTotals: {
                  percentCovered: undefined,
                },
              },
            },
          },
        },
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
        owner: {
          repository: {
            pull: {
              head: undefined,
              comparedTo: undefined,
              compareWithBase: {
                patchTotals: {
                  percentCovered: undefined,
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
        owner: {
          repository: {
            pull: { commits: { edges: [{ node: { state: 'error' } }] } },
          },
        },
      })
    })

    it('renders a error card', async () => {
      render(<CompareSummary />, { wrapper: wrapper() })
      const card = await screen.findByText(
        /There is an error processing the coverage reports with/i
      )
      expect(card).toBeInTheDocument()
    })
  })

  describe('Successful render', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            defaultBranch: 'main',
            pull: {
              behindBy: 82367894,
              behindByCommit: '1798hvs8ofhn',
              commits: {
                edges: [{ node: { state: 'complete', commitid: 'abc' } }],
              },
              head: {
                commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
                totals: {
                  percentCovered: 78.33,
                },
                uploads: {
                  totalCount: 4,
                },
              },
              comparedTo: {
                commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
                uploads: {
                  totalCount: 1,
                },
              },
              compareWithBase: {
                hasDifferentNumberOfHeadAndBaseReports: false,
                patchTotals: {
                  percentCovered: 92.12,
                },
                changeCoverage: 38.94,
              },
            },
          },
        },
      })
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

      const baseCommitIds = await screen.findAllByText('2d6c42f')
      expect(baseCommitIds).toHaveLength(1)
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

  describe('When base and head have different number of reports', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            pull: {
              commits: {
                edges: [{ node: { state: 'complete', commitid: 'abc' } }],
              },
              head: {
                commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
                totals: {
                  percentCovered: 78.33,
                },
                uploads: {
                  totalCount: 4,
                },
              },
              comparedTo: {
                commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
                uploads: {
                  totalCount: 1,
                },
              },
              compareWithBase: {
                hasDifferentNumberOfHeadAndBaseReports: true,
                patchTotals: {
                  percentCovered: 92.12,
                },
                changeCoverage: 38.94,
              },
            },
          },
        },
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
    })
  })

  describe('When PR is behind by the target branch', () => {
    beforeEach(() => {
      setup({
        owner: {
          repository: {
            defaultBranch: 'main',
            pull: {
              behindBy: 82367894,
              behindByCommit: '1798hvs8ofhn',
              commits: {
                edges: [{ node: { state: 'complete', commitid: 'abc' } }],
              },
              head: {
                commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
                totals: {
                  percentCovered: 78.33,
                },
                uploads: {
                  totalCount: 4,
                },
              },
              comparedTo: {
                commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
                uploads: {
                  totalCount: 1,
                },
              },
              compareWithBase: {
                hasDifferentNumberOfHeadAndBaseReports: true,
                patchTotals: {
                  percentCovered: 92.12,
                },
                changeCoverage: 38.94,
              },
            },
          },
        },
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
        owner: {
          repository: {
            defaultBranch: 'main',
            pull: {
              behindBy: 0,
              behindByCommit: undefined,
              commits: {
                edges: [{ node: { state: 'complete', commitid: 'abc' } }],
              },
              head: {
                commitid: 'fc43199b07c52cf3d6c19b7cdb368f74387c38ab',
                totals: {
                  percentCovered: 78.33,
                },
                uploads: {
                  totalCount: 4,
                },
              },
              comparedTo: {
                commitid: '2d6c42fe217c61b007b2c17544a9d85840381857',
                uploads: {
                  totalCount: 1,
                },
              },
              compareWithBase: {
                hasDifferentNumberOfHeadAndBaseReports: true,
                patchTotals: {
                  percentCovered: 92.12,
                },
                changeCoverage: 38.94,
              },
            },
          },
        },
      })

      render(<CompareSummary />, { wrapper: wrapper() })

      const baseCommitText = screen.queryByText(/BASE commit is/)
      expect(baseCommitText).not.toBeInTheDocument()

      const behindByNumber = screen.queryByText(/0/)
      expect(behindByNumber).not.toBeInTheDocument()
    })
  })
})
