import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import PullBundleAnalysis from './PullBundleAnalysis'

jest.mock('./PullBundleAnalysisTable', () => () => (
  <div>PullBundleAnalysisTable</div>
))

const mockOverview = ({
  coverageEnabled,
  bundleAnalysisEnabled,
}: {
  coverageEnabled: boolean
  bundleAnalysisEnabled: boolean
}) => ({
  owner: {
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled,
      bundleAnalysisEnabled,
      languages: [],
    },
  },
})

const mockSummaryData = {
  owner: {
    repository: {
      __typename: 'Repository',
      pull: {
        bundleAnalysisCompareWithBase: {
          __typename: 'BundleAnalysisComparison',
          sizeDelta: 10,
          loadTimeDelta: 0,
        },
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo/pull/12']}>
      <Route path="/:provider/:owner/:repo/pull/:pullId">
        <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
      </Route>
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

interface SetupArgs {
  coverageEnabled?: boolean
  bundleAnalysisEnabled?: boolean
}

describe('PullBundleAnalysis', () => {
  function setup({
    coverageEnabled = false,
    bundleAnalysisEnabled = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetRepoOverview', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data(mockOverview({ coverageEnabled, bundleAnalysisEnabled }))
        )
      }),
      graphql.query('PullBADropdownSummary', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data(mockSummaryData))
      })
    )
  }

  describe('coverage is enabled and bundles are enabled', () => {
    it('does not render bundle summary', async () => {
      setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
      render(<PullBundleAnalysis />, { wrapper })

      const loader = await screen.findByText('Loading')
      await waitForElementToBeRemoved(loader)

      const message = screen.queryByText(/Bundle report:/)
      expect(message).not.toBeInTheDocument()
    })

    it('displays the PullBundleAnalysisTable', async () => {
      setup({ coverageEnabled: true, bundleAnalysisEnabled: true })
      render(<PullBundleAnalysis />, { wrapper })

      const table = await screen.findByText('PullBundleAnalysisTable')
      expect(table).toBeInTheDocument()
    })
  })

  describe('coverage is disabled and bundles are enabled', () => {
    it('renders bundle summary', async () => {
      setup({ coverageEnabled: false, bundleAnalysisEnabled: true })
      render(<PullBundleAnalysis />, { wrapper })

      const message = await screen.findByText(/Bundle report:/)
      expect(message).toBeInTheDocument()
    })

    it('displays the PullBundleAnalysisTable', async () => {
      setup({ coverageEnabled: false, bundleAnalysisEnabled: true })
      render(<PullBundleAnalysis />, { wrapper })

      const table = await screen.findByText('PullBundleAnalysisTable')
      expect(table).toBeInTheDocument()
    })
  })
})
