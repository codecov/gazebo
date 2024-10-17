import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import SummaryDropdown from 'ui/SummaryDropdown'

import CommitBundleDropdown from './CommitBundleDropdown'

const mockSummaryData = (uncompress: number) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'BundleAnalysisComparison',
            bundleChange: {
              loadTime: {
                threeG: 2,
              },
              size: {
                uncompress,
              },
            },
          },
        },
      },
    },
  },
})

const mockNoData = { owner: null }

const mockFirstPullRequest = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'FirstPullRequest',
            message: 'First pull request',
          },
        },
      },
    },
  },
}

const mockErrorData = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        bundleAnalysis: {
          bundleAnalysisCompareWithParent: {
            __typename: 'MissingHeadCommit',
            message: 'missing head commit',
          },
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
        '/gh/codecov/test-repo/commit/803897e6ceeb6828778070208c06c5a978a48a68',
      ]}
    >
      <Route path="/:provider/:owner/:repo/commit/:commit">
        <Suspense fallback={<div>Loading...</div>}>
          <SummaryDropdown type="single">{children}</SummaryDropdown>
        </Suspense>
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
  noData?: boolean
  firstPullRequest?: boolean
  uncompress?: number
  comparisonError?: boolean
}

describe('CommitBundleDropdown', () => {
  function setup({
    noData = false,
    firstPullRequest = false,
    uncompress = 0,
    comparisonError = false,
  }: SetupArgs = {}) {
    const user = userEvent.setup()

    server.use(
      graphql.query('CommitBADropdownSummary', (info) => {
        if (noData) {
          return HttpResponse.json({ data: mockNoData })
        } else if (firstPullRequest) {
          return HttpResponse.json({ data: mockFirstPullRequest })
        } else if (comparisonError) {
          return HttpResponse.json({ data: mockErrorData })
        }

        return HttpResponse.json({ data: mockSummaryData(uncompress) })
      })
    )

    return { user }
  }

  describe('renders summary message', () => {
    describe('there is a positive size delta', () => {
      it('renders increase summary message', async () => {
        setup({ uncompress: 10000 })
        render(
          <CommitBundleDropdown>
            <p>Passed child</p>
          </CommitBundleDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Bundle report:/)
        expect(bundleReport).toBeInTheDocument()

        const increaseMessage = await screen.findByText(
          /changes will increase total bundle size by 10kB/
        )
        expect(increaseMessage).toBeInTheDocument()
      })
    })

    describe('there is a negative size delta', () => {
      it('renders decrease summary message', async () => {
        setup({ uncompress: -10000 })
        render(
          <CommitBundleDropdown>
            <p>Passed child</p>
          </CommitBundleDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Bundle report:/)
        expect(bundleReport).toBeInTheDocument()

        const decreaseMessage = await screen.findByText(
          /changes will decrease total bundle size by 10kB/
        )
        expect(decreaseMessage).toBeInTheDocument()
      })
    })

    describe('there is no size delta', () => {
      it('renders no change summary message', async () => {
        setup({ uncompress: 0 })
        render(
          <CommitBundleDropdown>
            <p>Passed child</p>
          </CommitBundleDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Bundle report:/)
        expect(bundleReport).toBeInTheDocument()

        const noChangeMessage = await screen.findByText(
          /bundle size has no change/
        )
        expect(noChangeMessage).toBeInTheDocument()
      })
    })
  })

  describe('there is a comparison error', () => {
    it('renders the error message', async () => {
      setup({ comparisonError: true })
      render(
        <CommitBundleDropdown>
          <p>Passed child</p>
        </CommitBundleDropdown>,
        { wrapper }
      )

      const message = await screen.findByText(/missing head commit/)
      expect(message).toBeInTheDocument()
    })
  })

  describe('there is no data', () => {
    it('unknown error message', async () => {
      setup({ noData: true })
      render(
        <CommitBundleDropdown>
          <p>Passed child</p>
        </CommitBundleDropdown>,
        { wrapper }
      )

      const message = await screen.findByText(/an unknown error occurred/)
      expect(message).toBeInTheDocument()
    })
  })

  describe('bundle analysis comparison is a first pull request', () => {
    it('first pull summary', async () => {
      setup({ firstPullRequest: true })
      render(
        <CommitBundleDropdown>
          <p>Passed child</p>
        </CommitBundleDropdown>,
        { wrapper }
      )

      const header = await screen.findByText(
        /once merged to default, your following pull request and commits will include report details/
      )
      expect(header).toBeInTheDocument()
    })
  })

  describe('expanding the dropdown', () => {
    it('renders the passed children', async () => {
      const { user } = setup({ uncompress: 10000 })
      render(
        <CommitBundleDropdown>
          <p>Passed child</p>
        </CommitBundleDropdown>,
        { wrapper }
      )

      const bundleReport = await screen.findByText(/Bundle report:/)
      expect(bundleReport).toBeInTheDocument()
      await user.click(bundleReport)

      const passedChild = await screen.findByText(/Passed child/)
      expect(passedChild).toBeInTheDocument()
    })
  })
})
