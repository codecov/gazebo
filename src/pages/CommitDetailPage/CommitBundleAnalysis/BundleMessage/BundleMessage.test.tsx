import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BundleMessage from './BundleMessage'

const mockSummaryData = (uncompress: number) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
          __typename: 'BundleAnalysisComparison',
          bundleChange: { loadTime: { threeG: 0 }, size: { uncompress } },
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

const mockFirstPullRequest = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysisCompareWithParent: {
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
  uncompress?: number
  noData?: boolean
  firstPullRequest?: boolean
  comparisonError?: boolean
}

describe('BundleMessage', () => {
  function setup(
    {
      uncompress = 0,
      noData = false,
      comparisonError = false,
      firstPullRequest = false,
    }: SetupArgs = {
      uncompress: 0,
      noData: false,
      comparisonError: false,
      firstPullRequest: false,
    }
  ) {
    server.use(
      graphql.query('CommitBADropdownSummary', (info) => {
        if (noData) {
          return HttpResponse.json({ data: mockNoData })
        } else if (firstPullRequest) {
          return HttpResponse.json({ data: mockFirstPullRequest })
        } else if (comparisonError) {
          return HttpResponse.json({ data: mockComparisonError })
        }

        return HttpResponse.json({ data: mockSummaryData(uncompress) })
      })
    )
  }

  describe('there are no errors', () => {
    describe('there are negative changes', () => {
      it('renders the negative changes message', async () => {
        setup({ uncompress: -1000 })
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
      it('renders the positive changes message', async () => {
        setup({ uncompress: 1000 })
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
      it('renders the no changes message', async () => {
        setup({ uncompress: 0 })
        render(<BundleMessage />, { wrapper })

        const title = await screen.findByText('Bundle report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(/bundle size has no change/)
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('there is a first pull request', () => {
    it('renders the first pull request message', async () => {
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

  describe('there is an error', () => {
    it('renders the error message', async () => {
      setup({ comparisonError: true })
      render(<BundleMessage />, { wrapper })

      const title = await screen.findByText('Bundle report:')
      expect(title).toBeInTheDocument()

      const message = await screen.findByText(/missing head commit/)
      expect(message).toBeInTheDocument()
    })
  })

  describe('there is no data and no error', () => {
    it('renders the unknown error message', async () => {
      setup({ noData: true })
      render(<BundleMessage />, { wrapper })

      const title = await screen.findByText('Bundle report:')
      expect(title).toBeInTheDocument()

      const message = await screen.findByText(/an unknown error occurred/)
      expect(message).toBeInTheDocument()
    })
  })
})