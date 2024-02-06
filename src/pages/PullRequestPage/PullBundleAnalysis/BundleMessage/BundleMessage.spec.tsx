import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleMessage from './BundleMessage'

const mockNoData = { owner: null }

const mockSummaryData = (sizeDelta: number) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          sizeDelta,
          loadTimeDelta: 0,
        },
      },
    },
  },
})

const mockComparisonError = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        bundleAnalysisCompareWithBase: {
          __typename: 'MissingHeadCommit',
          message: 'Missing head commit',
        },
      },
    },
  },
}

const mockFirstPullRequest = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        bundleAnalysisCompareWithBase: {
          __typename: 'FirstPullRequest',
          message: 'First pull request',
        },
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      suspense: true,
    },
  },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/123']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </Route>
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

interface SetupArgs {
  sizeDelta?: number
  noData?: boolean
  firstPullRequest?: boolean
  comparisonError?: boolean
}

describe('BundleMessage', () => {
  function setup(
    {
      sizeDelta = 0,
      noData = false,
      comparisonError = false,
      firstPullRequest = false,
    }: SetupArgs = {
      sizeDelta: 0,
      noData: false,
      comparisonError: false,
      firstPullRequest: false,
    }
  ) {
    server.use(
      graphql.query('PullBADropdownSummary', (req, res, ctx) => {
        if (noData) {
          return res(ctx.status(200), ctx.data(mockNoData))
        } else if (firstPullRequest) {
          return res(ctx.status(200), ctx.data(mockFirstPullRequest))
        } else if (comparisonError) {
          return res(ctx.status(200), ctx.data(mockComparisonError))
        }

        return res(ctx.status(200), ctx.data(mockSummaryData(sizeDelta)))
      })
    )
  }

  describe('there are no errors', () => {
    describe('there are negative changes', () => {
      it('renders decrease in bundle size message', async () => {
        setup({ sizeDelta: -1000 })
        render(<BundleMessage />, { wrapper })

        const title = await screen.findByText('Bundle report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(
          /changes will decrease total bundle size by 1kB/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('there are positive changes', () => {
      it('renders increase in bundle size message', async () => {
        setup({ sizeDelta: 1000 })
        render(<BundleMessage />, { wrapper })

        const title = await screen.findByText('Bundle report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(
          /changes will increase total bundle size by 1kB/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('there are no changes', () => {
      it('renders no changes message', async () => {
        setup({ sizeDelta: 0 })
        render(<BundleMessage />, { wrapper })

        const title = await screen.findByText('Bundle report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(/bundle size has no change/)
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('there is a first pull request', () => {
    it('renders first pull request message', async () => {
      setup({ firstPullRequest: true })
      render(<BundleMessage />, { wrapper })

      const title = await screen.findByText('Bundle report:')
      expect(title).toBeInTheDocument()

      const message = await screen.findByText(
        /once merged to default, your following pull request and commits will include report details/
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('there is a comparison error', () => {
    it('renders comparison error message', async () => {
      setup({ comparisonError: true })
      render(<BundleMessage />, { wrapper })

      const title = await screen.findByText('Bundle report:')
      expect(title).toBeInTheDocument()

      const message = await screen.findByText(/missing head commit/)
      expect(message).toBeInTheDocument()
    })
  })

  describe('there is no data', () => {
    it('renders unknown error message', async () => {
      setup({ noData: true })
      render(<BundleMessage />, { wrapper })

      const title = await screen.findByText('Bundle report:')
      expect(title).toBeInTheDocument()

      const message = await screen.findByText(/an unknown error occurred/)
      expect(message).toBeInTheDocument()
    })
  })
})
