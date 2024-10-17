import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import SummaryDropdown from 'ui/SummaryDropdown'

import PullCoverageDropdown from './PullCoverageDropdown'

const mockSummaryData = (patchTotals: {
  missesCount: number | null
  partialsCount: number | null
}) => {
  return {
    owner: {
      repository: {
        __typename: 'Repository',
        pull: {
          compareWithBase: {
            __typename: 'Comparison',
            patchTotals,
          },
        },
      },
    },
  }
}

const mockNoData = { owner: null }

const mockFirstPullRequest = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
          __typename: 'FirstPullRequest',
          message: 'First pull request',
        },
      },
    },
  },
}

const mockComparisonError = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        compareWithBase: {
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
    <MemoryRouter initialEntries={['/gh/codecov/test-repo/pull/123']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">
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
  comparisonError?: boolean
  patchTotals?: {
    missesCount: number | null
    partialsCount: number | null
  }
  firstPullRequest?: boolean
}

describe('PullCoverageDropdown', () => {
  function setup({
    noData = false,
    comparisonError = false,
    patchTotals = { missesCount: 0, partialsCount: 0 },
    firstPullRequest = false,
  }: SetupArgs) {
    const user = userEvent.setup()

    server.use(
      graphql.query('PullCoverageDropdownSummary', (info) => {
        if (noData) {
          return HttpResponse.json({ data: mockNoData })
        } else if (comparisonError) {
          return HttpResponse.json({ data: mockComparisonError })
        } else if (firstPullRequest) {
          return HttpResponse.json({ data: mockFirstPullRequest })
        }

        return HttpResponse.json({ data: mockSummaryData(patchTotals) })
      })
    )

    return { user }
  }

  describe('renders summary message', () => {
    describe('there are missing lines', () => {
      it('renders missing lines message', async () => {
        setup({ patchTotals: { missesCount: 10, partialsCount: 10 } })
        render(
          <PullCoverageDropdown>
            <p>Passed child</p>
          </PullCoverageDropdown>,
          { wrapper }
        )

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const message = await screen.findByText(
          /20 lines in your changes are missing coverage/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('there is one line missing', () => {
      it('renders singular missing line message', async () => {
        setup({ patchTotals: { missesCount: 1, partialsCount: 0 } })
        render(
          <PullCoverageDropdown>
            <p>Passed child</p>
          </PullCoverageDropdown>,
          { wrapper }
        )

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const message = await screen.findByText(
          /1 line in your changes are missing coverage/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('there are no missing lines', () => {
      it('renders all lines covered message', async () => {
        setup({ patchTotals: { missesCount: 0, partialsCount: 0 } })
        render(
          <PullCoverageDropdown>
            <p>Passed child</p>
          </PullCoverageDropdown>,
          { wrapper }
        )

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const message = await screen.findByText(
          /all modified lines are covered by tests/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('patch totals are null', () => {
      it('renders all lines covered message', async () => {
        setup({ patchTotals: { missesCount: null, partialsCount: null } })
        render(
          <PullCoverageDropdown>
            <p>Passed child</p>
          </PullCoverageDropdown>,
          { wrapper }
        )

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const message = await screen.findByText(
          /all modified lines are covered by tests/
        )
        expect(message).toBeInTheDocument()
      })
    })

    describe('there is no data', () => {
      it('renders unknown error message', async () => {
        setup({ noData: true })
        render(
          <PullCoverageDropdown>
            <p>Passed child</p>
          </PullCoverageDropdown>,
          { wrapper }
        )

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const message = await screen.findByText(/an unknown error has occurred/)
        expect(message).toBeInTheDocument()
      })
    })

    describe('there is a comparison error', () => {
      it('renders error message', async () => {
        setup({ comparisonError: true })
        render(
          <PullCoverageDropdown>
            <p>Passed child</p>
          </PullCoverageDropdown>,
          { wrapper }
        )

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const message = await screen.findByText(/missing head commit/)
        expect(message).toBeInTheDocument()
      })
    })

    describe('there is a first pull request error', () => {
      it('renders first pr message', async () => {
        setup({ firstPullRequest: true })
        render(
          <PullCoverageDropdown>
            <p>Passed child</p>
          </PullCoverageDropdown>,
          { wrapper }
        )

        const coverageReport = await screen.findByText(/Coverage report:/)
        expect(coverageReport).toBeInTheDocument()

        const message = await screen.findByText(
          /once merged to default, your following pull request and commits will include report details/
        )
        expect(message).toBeInTheDocument()
      })
    })
  })

  describe('expanding the dropdown', () => {
    it('renders the passed children', async () => {
      const { user } = setup({
        patchTotals: { missesCount: 10, partialsCount: 10 },
      })
      render(
        <PullCoverageDropdown>
          <p>Passed child</p>
        </PullCoverageDropdown>,
        { wrapper }
      )

      const coverageReport = await screen.findByText(/Coverage report:/)
      expect(coverageReport).toBeInTheDocument()
      await user.click(coverageReport)

      const passedChild = await screen.findByText(/Passed child/)
      expect(passedChild).toBeInTheDocument()
    })
  })
})
