import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import SummaryDropdown from 'ui/SummaryDropdown'

import CommitCoverageDropdown from './CommitCoverageDropdown'

const mockSummaryData = (patchTotals: {
  missesCount: number | null
  partialsCount: number | null
}) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
          __typename: 'Comparison',
          patchTotals,
        },
      },
    },
  },
})

const mockNoData = { owner: null }

const mockNoComparison = {
  owner: {
    repository: {
      __typename: 'Repository',
      commit: {
        compareWithParent: {
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
  noComparison?: boolean
  patchTotals?: {
    missesCount: number | null
    partialsCount: number | null
  }
}

describe('CommitCoverageDropdown', () => {
  function setup({
    noData = false,
    noComparison = false,
    patchTotals = {
      missesCount: 0,
      partialsCount: 0,
    },
  }: SetupArgs = {}) {
    const user = userEvent.setup()

    server.use(
      graphql.query('CommitDropdownSummary', (req, res, ctx) => {
        if (noData) {
          return res(ctx.status(200), ctx.data(mockNoData))
        } else if (noComparison) {
          return res(ctx.status(200), ctx.data(mockNoComparison))
        }

        return res(ctx.status(200), ctx.data(mockSummaryData(patchTotals)))
      })
    )

    return { user }
  }

  describe('renders summary message', () => {
    describe('there are missing lines', () => {
      it('renders missing lines message', async () => {
        setup({
          patchTotals: {
            missesCount: 10,
            partialsCount: 10,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage Report:/)
        expect(bundleReport).toBeInTheDocument()

        const increaseMessage = await screen.findByText(
          /20 lines in your changes are missing coverage/
        )
        expect(increaseMessage).toBeInTheDocument()
      })
    })

    describe('there is one missing line', () => {
      it('renders non-plural missing line message', async () => {
        setup({
          patchTotals: {
            missesCount: 1,
            partialsCount: 0,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage Report:/)
        expect(bundleReport).toBeInTheDocument()

        const increaseMessage = await screen.findByText(
          /1 line in your changes are missing coverage/
        )
        expect(increaseMessage).toBeInTheDocument()
      })
    })

    describe('there is no missing lines', () => {
      it('renders all lines covered message', async () => {
        setup({
          patchTotals: {
            missesCount: 0,
            partialsCount: 0,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage Report:/)
        expect(bundleReport).toBeInTheDocument()

        const noChangeMessage = await screen.findByText(
          /all modified lines are covered by tests/
        )
        expect(noChangeMessage).toBeInTheDocument()
      })
    })

    describe('patch totals are null', () => {
      it('renders all lines covered message', async () => {
        setup({
          patchTotals: {
            missesCount: null,
            partialsCount: null,
          },
        })
        render(
          <CommitCoverageDropdown>
            <p>Passed child</p>
          </CommitCoverageDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Coverage Report:/)
        expect(bundleReport).toBeInTheDocument()

        const noChangeMessage = await screen.findByText(
          /all modified lines are covered by tests/
        )
        expect(noChangeMessage).toBeInTheDocument()
      })
    })
  })

  describe('there is no data', () => {
    it('does not render', async () => {
      setup({ noData: true })
      const { container } = render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const loading = await screen.findByText('Loading...')
      await waitForElementToBeRemoved(loading)

      expect(container).toHaveTextContent('')
    })
  })

  describe('there is no comparison', () => {
    it('does not render', async () => {
      setup({ noComparison: true })
      const { container } = render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const loading = await screen.findByText('Loading...')
      await waitForElementToBeRemoved(loading)

      expect(container).toHaveTextContent('')
    })
  })

  describe('expanding the dropdown', () => {
    it('renders the passed children', async () => {
      const { user } = setup({
        patchTotals: {
          missesCount: 10,
          partialsCount: 10,
        },
      })
      render(
        <CommitCoverageDropdown>
          <p>Passed child</p>
        </CommitCoverageDropdown>,
        { wrapper }
      )

      const bundleReport = await screen.findByText(/Coverage Report:/)
      expect(bundleReport).toBeInTheDocument()
      await user.click(bundleReport)

      const passedChild = await screen.findByText(/Passed child/)
      expect(passedChild).toBeInTheDocument()
    })
  })
})
