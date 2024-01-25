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

import CommitBundleDropdown from './CommitBundleDropdown'

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

const mockNoRepo = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'Not found',
    },
  },
}

const mockNoComparison = {
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
  noRepository?: boolean
  noBundleAnalysisComparison?: boolean
  sizeDelta?: number
}

describe('CommitBundleDropdown', () => {
  function setup({
    noData = false,
    noRepository = false,
    noBundleAnalysisComparison = false,
    sizeDelta = 0,
  }: SetupArgs = {}) {
    const user = userEvent.setup()

    server.use(
      graphql.query('CommitBADropdownSummary', (req, res, ctx) => {
        if (noData) {
          return res(ctx.status(200), ctx.data(mockNoData))
        } else if (noRepository) {
          return res(ctx.status(200), ctx.data(mockNoRepo))
        } else if (noBundleAnalysisComparison) {
          return res(ctx.status(200), ctx.data(mockNoComparison))
        }

        return res(ctx.status(200), ctx.data(mockSummaryData(sizeDelta)))
      })
    )

    return { user }
  }

  describe('renders summary message', () => {
    describe('there is a positive size delta', () => {
      it('renders increase summary message', async () => {
        setup({ sizeDelta: 10000 })
        render(
          <CommitBundleDropdown>
            <p>Passed child</p>
          </CommitBundleDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Bundle Report:/)
        expect(bundleReport).toBeInTheDocument()

        const increaseMessage = await screen.findByText(
          /changes will increase total bundle size by 10kB/
        )
        expect(increaseMessage).toBeInTheDocument()
      })
    })

    describe('there is a negative size delta', () => {
      it('renders decrease summary message', async () => {
        setup({ sizeDelta: -10000 })
        render(
          <CommitBundleDropdown>
            <p>Passed child</p>
          </CommitBundleDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Bundle Report:/)
        expect(bundleReport).toBeInTheDocument()

        const decreaseMessage = await screen.findByText(
          /changes will decrease total bundle size by 10kB/
        )
        expect(decreaseMessage).toBeInTheDocument()
      })
    })

    describe('there is no size delta', () => {
      it('renders no change summary message', async () => {
        setup({ sizeDelta: 0 })
        render(
          <CommitBundleDropdown>
            <p>Passed child</p>
          </CommitBundleDropdown>,
          { wrapper }
        )

        const bundleReport = await screen.findByText(/Bundle Report:/)
        expect(bundleReport).toBeInTheDocument()

        const noChangeMessage = await screen.findByText(
          /bundle size has no change/
        )
        expect(noChangeMessage).toBeInTheDocument()
      })
    })
  })

  describe('there is no data', () => {
    it('does not render', async () => {
      setup({ noData: true })
      const { container } = render(
        <CommitBundleDropdown>
          <p>Passed child</p>
        </CommitBundleDropdown>,
        { wrapper }
      )

      const loading = await screen.findByText('Loading...')
      await waitForElementToBeRemoved(loading)

      expect(container).toHaveTextContent('')
    })
  })

  describe('there is no bundle analysis comparison', () => {
    it('does not render', async () => {
      setup({ noBundleAnalysisComparison: true })
      const { container } = render(
        <CommitBundleDropdown>
          <p>Passed child</p>
        </CommitBundleDropdown>,
        { wrapper }
      )

      const loading = await screen.findByText('Loading...')
      await waitForElementToBeRemoved(loading)

      expect(container).toHaveTextContent('')
    })
  })

  describe('expanding the dropdown', () => {
    it('renders the passed children', async () => {
      const { user } = setup({ sizeDelta: 10000 })
      render(
        <CommitBundleDropdown>
          <p>Passed child</p>
        </CommitBundleDropdown>,
        { wrapper }
      )

      const bundleReport = await screen.findByText(/Bundle Report:/)
      expect(bundleReport).toBeInTheDocument()
      await user.click(bundleReport)

      const passedChild = await screen.findByText(/Passed child/)
      expect(passedChild).toBeInTheDocument()
    })
  })
})
