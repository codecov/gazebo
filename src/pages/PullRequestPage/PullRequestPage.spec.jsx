import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import PullRequestPage from './PullRequestPage'

jest.mock('shared/featureFlags')

jest.mock('./Summary', () => () => 'CompareSummary')
jest.mock('./PullRequestPageContent', () => () => 'PullRequestPageContent')
jest.mock('./PullRequestPageTabs', () => () => 'PullRequestPageTabs')
jest.mock('./FirstPullBanner', () => () => 'FirstPullBanner')

const mockPullHeadData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        pullId: 12,
        title: 'Cool New Pull Request',
        state: 'OPEN',
        author: {
          username: 'cool-user',
        },
        head: {
          branchName: 'cool-new-branch',
          ciPassed: true,
        },
        updatestamp: '2023-01-01T12:00:00.000000',
      },
    },
  },
}

const mockPullPageData = {
  pullId: 1,
  head: {
    commitid: '123',
  },
  compareWithBase: {
    __typename: 'Comparison',
    impactedFilesCount: 4,
    indirectChangedFilesCount: 0,
    flagComparisonsCount: 1,
    componentComparisonsCount: 6,
    directChangedFilesCount: 0,
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh/test-org/test-repo/pull/12') =>
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
})
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => {
  server.close()
})

describe('PullRequestPage', () => {
  function setup({ pullData = mockPullPageData }) {
    server.use(
      graphql.query('PullHeadData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockPullHeadData))
      ),
      graphql.query('PullPageData', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                pull: pullData,
              },
            },
          })
        )
      )
    )
  }

  describe('when pull data is available', () => {
    beforeEach(() => setup({}))

    it('renders breadcrumb', async () => {
      render(<PullRequestPage />, { wrapper: wrapper() })

      const org = await screen.findByRole('link', { name: 'test-org' })
      expect(org).toBeInTheDocument()
      expect(org).toHaveAttribute('href', '/gh/test-org')

      const repo = await screen.findByRole('link', { name: 'test-repo' })
      expect(repo).toBeInTheDocument()
      expect(repo).toHaveAttribute('href', '/gh/test-org/test-repo')

      const pulls = await screen.findByRole('link', { name: 'Pulls' })
      expect(pulls).toBeInTheDocument()
      expect(pulls).toHaveAttribute('href', '/gh/test-org/test-repo/pulls')

      const pullId = await screen.findByText('12')
      expect(pullId).toBeInTheDocument()
    })

    it('renders header', async () => {
      render(<PullRequestPage />, { wrapper: wrapper() })

      const title = await screen.findByRole('heading', {
        name: /Cool New Pull Request/,
      })
      expect(title).toBeInTheDocument()
    })

    it('renders compare summary', async () => {
      render(<PullRequestPage />, { wrapper: wrapper() })

      const compareSummary = await screen.findByText(/CompareSummary/)
      expect(compareSummary).toBeInTheDocument()
    })

    it('renders pull request page tabs', async () => {
      render(<PullRequestPage />, { wrapper: wrapper() })

      const pullRequestPageTabs = await screen.findByText(/PullRequestPageTabs/)
      expect(pullRequestPageTabs).toBeInTheDocument()
    })

    it('renders pull request page content', async () => {
      render(<PullRequestPage />, { wrapper: wrapper() })

      const pullRequestPageContent = await screen.findByText(
        /PullRequestPageContent/
      )
      expect(pullRequestPageContent).toBeInTheDocument()
    })

    it('renders the first pull request banner', async () => {
      render(<PullRequestPage />, { wrapper: wrapper() })

      const firstPullRequestBanner = await screen.findByText(/FirstPullBanner/)
      expect(firstPullRequestBanner).toBeInTheDocument()
    })
  })

  describe('when there is no pull data', () => {
    beforeEach(() => setup({ pullData: null }))

    it('renders not found', async () => {
      render(<PullRequestPage />, { wrapper: wrapper() })

      const notFound = await screen.findByText(/Not found/)
      expect(notFound).toBeInTheDocument()
    })
  })
})
