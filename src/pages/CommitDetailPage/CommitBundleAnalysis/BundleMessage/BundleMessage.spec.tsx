import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleMessage from './BundleMessage'

const mockSummaryData = (sizeDelta: number) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'BundleAnalysisComparison',
          sizeDelta,
          loadTimeDelta: 0,
        },
      },
    },
  },
})

const mockNoData = { owner: null }

const mockComparisonError = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'MissingHeadCommit',
          message: 'Missing head commit',
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
    <MemoryRouter
      initialEntries={[
        '/gh/test-org/test-repo/commit/e736f78b3cb5c8abb1d6b2ec5e5102de455f98ed',
      ]}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit">
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
    { sizeDelta = 0, noData = false, comparisonError = false }: SetupArgs = {
      sizeDelta: 0,
      noData: false,
      comparisonError: false,
    }
  ) {
    server.use(
      graphql.query('CommitBADropdownSummary', (req, res, ctx) => {
        if (noData) {
          return res(ctx.status(200), ctx.data(mockNoData))
        } else if (comparisonError) {
          return res(ctx.status(200), ctx.data(mockComparisonError))
        }

        return res(ctx.status(200), ctx.data(mockSummaryData(sizeDelta)))
      })
    )
  }

  describe('there are no errors', () => {
    describe('there are negative changes', () => {
      it('renders the negative changes message', async () => {
        setup({ sizeDelta: -1000 })
        render(<BundleMessage />, { wrapper })

        const title = await screen.findByText('Bundle Report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(
          /changes will decrease total bundle size by 1kB/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('there are positive changes', () => {
      it('renders the positive changes message', async () => {
        setup({ sizeDelta: 1000 })
        render(<BundleMessage />, { wrapper })

        const title = await screen.findByText('Bundle Report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(
          /changes will increase total bundle size by 1kB/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('there are no changes', () => {
      it('renders the no changes message', async () => {
        setup({ sizeDelta: 0 })
        render(<BundleMessage />, { wrapper })

        const title = await screen.findByText('Bundle Report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(/bundle size has no change/)
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('there is an error', () => {
    it('renders the error message', async () => {
      setup({ comparisonError: true })
      render(<BundleMessage />, { wrapper })

      const title = await screen.findByText('Bundle Report:')
      expect(title).toBeInTheDocument()

      const message = await screen.findByText(/missing head commit/)
      expect(message).toBeInTheDocument()
    })
  })

  describe('there is no data and no error', () => {
    it('renders the unknown error message', async () => {
      setup({ noData: true })
      render(<BundleMessage />, { wrapper })

      const title = await screen.findByText('Bundle Report:')
      expect(title).toBeInTheDocument()

      const message = await screen.findByText(/an unknown error occurred/)
      expect(message).toBeInTheDocument()
    })
  })
})
