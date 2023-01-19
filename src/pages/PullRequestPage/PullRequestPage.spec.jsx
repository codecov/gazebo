import { render, screen, waitFor } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useFlags } from 'shared/featureFlags'

import { ComparisonReturnType } from './ErrorBanner/constants.js'
import { usePullPageData } from './hooks/usePullPageData'
import PullRequestPage from './PullRequestPage'

jest.mock('./Header', () => () => 'Header')
jest.mock('./Summary', () => () => 'CompareSummary')
jest.mock('./Flags', () => () => 'Flags')
jest.mock('./Commits', () => () => 'Commits')
jest.mock('./subroute/Root', () => () => 'Root')
jest.mock('./ErrorBanner', () => () => 'Error Banner')
jest.mock('./IndirectChangesTab', () => () => 'IndirectChangesTab')
jest.mock('pages/RepoPage/CommitsTab/CommitsTable', () => () => 'Commits Table')
jest.mock(
  './IndirectChangesTab/IndirectChangesInfo',
  () => () => 'IndirectChangesInfo'
)

jest.mock('./hooks/usePullPageData')
jest.mock('shared/featureFlags')

const commits = {
  owner: {
    repository: {
      commits: {
        edges: [
          {
            node: {
              message: 'test2',
              commitid: '2',
              createdAt: '2021',
              author: {
                username: 'rula2',
                avatarUrl: 'random',
              },
              pullId: 12,
              totals: {
                coverage: 19,
              },
              parent: {
                totals: {
                  coverage: 22,
                },
              },
              compareWithParent: {
                patchTotals: {
                  coverage: 99,
                },
              },
            },
          },
        ],
        pageInfo: {
          hasNextPage: false,
          endCursor: 'MjAyMC0wOC0xMSAxNzozMDowMiswMDowMHwxMDA=',
        },
      },
    },
  },
}

const queryClient = new QueryClient()

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('PullRequestPage', () => {
  function setup({
    hasAccess = false,
    pullData = {},
    initialEntries = ['/gh/test-org/test-repo/pull/12'],
    pullPageTabsFlag = false,
  }) {
    server.use(
      graphql.query('GetCommits', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(commits))
      )
    )

    usePullPageData.mockReturnValue({
      data: { hasAccess, pull: pullData },
    })

    useFlags.mockReturnValue({
      pullPageTabs: pullPageTabsFlag,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <Route path="/:provider/:owner/:repo/pull/:pullId" exact={true}>
            <PullRequestPage />
          </Route>
          <Route
            path="/:provider/:owner/:repo/pull/:pullId/commits"
            exact={true}
          >
            <PullRequestPage />
          </Route>
          <Route
            path="/:provider/:owner/:repo/pull/:pullId/indirect-changes"
            exact={true}
          >
            <PullRequestPage />
          </Route>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }

  describe('show 404 if repo is private and user not part of the org', () => {
    describe('the main breadcrumb', () => {
      beforeEach(() => {
        setup({
          hasAccess: false,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
      })

      it('does not render the breadcrumbs', () => {
        expect(
          screen.queryByRole('link', {
            name: /test-org/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /test-repo/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /pulls/i,
          })
        ).not.toBeInTheDocument()
      })
    })

    describe('root', () => {
      beforeEach(async () => {
        setup({
          hasAccess: false,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('renders a 404', () => {
        expect(screen.getByText(/Error 404/i)).toBeInTheDocument()
      })
    })
  })

  describe('show 404 if no pull request data', () => {
    describe('the main breadcrumb', () => {
      beforeEach(() => {
        setup({
          hasAccess: true,
          pullData: null,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
      })

      it('does not render the breadcrumbs', () => {
        expect(
          screen.queryByRole('link', {
            name: /test-org/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /test-repo/i,
          })
        ).not.toBeInTheDocument()
        expect(
          screen.queryByRole('link', {
            name: /pulls/i,
          })
        ).not.toBeInTheDocument()
      })
    })

    describe('root', () => {
      beforeEach(async () => {
        setup({
          hasAccess: true,
          pullData: null,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('renders a 404', () => {
        expect(screen.getByText(/Error 404/i)).toBeInTheDocument()
      })
    })
  })

  describe('shows error banner when comparison type throws an error', () => {
    describe('the main page', () => {
      beforeEach(() => {
        setup({
          hasAccess: true,
          pullData: {
            compareWithBase: {
              __typename: ComparisonReturnType.MISSING_BASE_COMMIT,
            },
          },
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
      })

      it('renders the error banner', () => {
        expect(screen.getByText(/Error Banner/i)).toBeInTheDocument()
      })

      it('does not render the root', () => {
        expect(screen.queryByText(/Root/i)).not.toBeInTheDocument()
      })

      it('does not render the commits', () => {
        expect(screen.queryByText(/Commits/i)).not.toBeInTheDocument()
      })

      it('does not render the flags', () => {
        expect(screen.queryByText(/Flags/i)).not.toBeInTheDocument()
      })
    })

    describe('root', () => {
      beforeEach(async () => {
        setup({
          hasAccess: true,
          pullData: null,
          initialEntries: ['/gh/test-org/test-repo/pull/12'],
        })
        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('renders a 404', () => {
        expect(screen.getByText(/Error 404/i)).toBeInTheDocument()
      })
    })
  })

  describe('the main breadcrumb', () => {
    beforeEach(() => {
      setup({
        hasAccess: true,
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
    })

    it('renders', () => {
      expect(
        screen.getByRole('link', {
          name: /test-org/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /test-repo/i,
        })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('link', {
          name: /pulls/i,
        })
      ).toBeInTheDocument()
    })
  })

  describe('root', () => {
    beforeEach(async () => {
      setup({
        hasAccess: true,
        pullData: {
          compareWithBase: {
            __typename: ComparisonReturnType.SUCCESFUL_COMPARISON,
          },
        },
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('rendered', () => {
      expect(screen.getByText(/Root/i)).toBeInTheDocument()
    })

    it(`Isn't 404ing`, () => {
      expect(screen.queryByText(/Error 404/i)).not.toBeInTheDocument()
    })
  })

  describe('compare summary', () => {
    beforeEach(async () => {
      setup({
        hasAccess: true,
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/CompareSummary/i)).toBeInTheDocument()
    })
  })

  describe('header', () => {
    beforeEach(async () => {
      setup({
        hasAccess: true,
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Header/i)).toBeInTheDocument()
    })
  })

  describe('flags', () => {
    beforeEach(async () => {
      setup({
        hasAccess: true,
        pullData: {
          compareWithBase: {
            __typename: ComparisonReturnType.SUCCESFUL_COMPARISON,
          },
        },
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Flags/i)).toBeInTheDocument()
    })
  })

  describe('commits', () => {
    beforeEach(async () => {
      setup({
        hasAccess: true,
        pullData: {
          compareWithBase: {
            __typename: ComparisonReturnType.SUCCESFUL_COMPARISON,
          },
        },
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders', () => {
      expect(screen.getByText(/Commits/i)).toBeInTheDocument()
    })
  })

  describe('nav links', () => {
    beforeEach(async () => {
      setup({
        hasAccess: true,
        pullData: {
          commits: {
            totalCount: 11,
          },
          compareWithBase: {
            impactedFilesCount: 9,
            indirectChangedFilesCount: 19,
            flagComparisonsCount: 91,
            __typename: ComparisonReturnType.SUCCESFUL_COMPARISON,
          },
        },
        initialEntries: ['/gh/test-org/test-repo/pull/12'],
        pullPageTabsFlag: true,
      })
      await waitFor(() =>
        expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
      )
    })

    it('renders impacted files tab', () => {
      const impactedFilesTab = screen.getByText(/Impacted files/i)
      expect(impactedFilesTab).toBeInTheDocument()

      impactedFilesTab.click()
      expect(screen.getByText('Root')).toBeInTheDocument()
    })

    it('renders impacted files tab count', () => {
      expect(screen.getByText('9')).toBeInTheDocument()
    })

    it('renders indirect changes tab', () => {
      expect(screen.getByText(/Indirect changes/i)).toBeInTheDocument()
    })

    it('renders indirect changes tab count', () => {
      expect(screen.getByText('19')).toBeInTheDocument()
    })

    it('renders commits tab', () => {
      expect(screen.getByText(/Commits/i)).toBeInTheDocument()
    })

    it('renders commits tab count', () => {
      expect(screen.getByText('11')).toBeInTheDocument()
    })

    it('renders flags tab', () => {
      expect(screen.getByText(/Flags/i)).toBeInTheDocument()
    })

    it('renders flags tab count', () => {
      expect(screen.getByText('91')).toBeInTheDocument()
    })

    it('renders the name of the header and coverage labels', () => {
      expect(screen.getByText('covered')).toBeInTheDocument()
      expect(screen.getByText('partial')).toBeInTheDocument()
      expect(screen.getByText('uncovered')).toBeInTheDocument()
    })

    describe('Pull commits', () => {
      beforeEach(async () => {
        screen.getByText(/Commits/i).click()

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('renders commits table', () => {
        expect(screen.getByText(/Commits Table/i)).toBeInTheDocument()
      })
    })

    describe('when clicking on indirect changes tab', () => {
      beforeEach(async () => {
        screen.getByText(/Indirect changes/i).click()

        await waitFor(() =>
          expect(screen.queryByTestId('spinner')).not.toBeInTheDocument()
        )
      })

      it('renders the indirect changes tab', () => {
        expect(screen.getByText(/IndirectChangesTab/)).toBeInTheDocument()
      })

      it('renders the information text of indirect changes', () => {
        expect(screen.getByText(/IndirectChangesInfo/)).toBeInTheDocument()
      })
    })
  })
})
