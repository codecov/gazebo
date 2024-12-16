import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import SummaryDropdown from 'ui/SummaryDropdown'

import PullBundleDropdown from './PullBundleDropdown'

const mockNoData = { owner: null }

const mockSummaryData = (uncompress: number) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        head: {
          commitid: '2788fb9824b079807f7992f04482450c09774ec7',
        },
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          bundleChange: {
            loadTime: {
              threeG: 0,
            },
            size: {
              uncompress,
            },
          },
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
        head: {
          commitid: '2788fb9824b079807f7992f04482450c09774ec7',
        },
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
        head: {
          commitid: '2788fb9824b079807f7992f04482450c09774ec7',
        },
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
        <Suspense fallback={<p>Loading...</p>}>
          <SummaryDropdown type="multiple">{children}</SummaryDropdown>
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
    const user = userEvent.setup()

    server.use(
      graphql.query('PullBADropdownSummary', () => {
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

    return { user }
  }

  describe('renders summary message', () => {
    describe('there are no errors', () => {
      describe('there are negative changes', () => {
        it('renders decrease in bundle size message', async () => {
          setup({ uncompress: -1000 })
          render(<PullBundleDropdown>Passed child</PullBundleDropdown>, {
            wrapper,
          })

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
          setup({ uncompress: 1000 })
          render(<PullBundleDropdown>Passed child</PullBundleDropdown>, {
            wrapper,
          })

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
          setup({ uncompress: 0 })
          render(<PullBundleDropdown>Passed child</PullBundleDropdown>, {
            wrapper,
          })

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
        render(<PullBundleDropdown>Passed child</PullBundleDropdown>, {
          wrapper,
        })

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
        render(<PullBundleDropdown>Passed child</PullBundleDropdown>, {
          wrapper,
        })

        const title = await screen.findByText('Bundle report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(/missing head commit/)
        expect(message).toBeInTheDocument()
      })
    })

    describe('there is no data', () => {
      it('renders unknown error message', async () => {
        setup({ noData: true })
        render(<PullBundleDropdown>Passed child</PullBundleDropdown>, {
          wrapper,
        })

        const title = await screen.findByText('Bundle report:')
        expect(title).toBeInTheDocument()

        const message = await screen.findByText(/an unknown error occurred/)
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('expanding the dropdown', () => {
    it('renders the passed children', async () => {
      const { user } = setup({ uncompress: -1000 })
      render(<PullBundleDropdown>Passed child</PullBundleDropdown>, {
        wrapper,
      })

      const bundleReport = await screen.findByText(/Bundle report:/)
      expect(bundleReport).toBeInTheDocument()
      await user.click(bundleReport)

      const passedChild = await screen.findByText(/Passed child/)
      expect(passedChild).toBeInTheDocument()
    })
  })
})
