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

import { TierNames } from 'services/tier'
import { useFlags } from 'shared/featureFlags'

import PullBundleAnalysis from './PullBundleAnalysis'

jest.mock('./PullBundleAnalysisTable', () => () => (
  <div>PullBundleAnalysisTable</div>
))

jest.mock('shared/featureFlags')
const mockedUseFlags = useFlags as jest.Mock<{
  multipleTiers: boolean
}>

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
  function setup({ coverageEnabled, bundleAnalysisEnabled }: SetupArgs) {
    mockedUseFlags.mockReturnValue({
      multipleTiers: true,
    })

    server.use(
      graphql.query('PullPageData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              repository: {
                __typename: 'Repository',
                coverageEnabled: coverageEnabled,
                bundleAnalysisEnabled: bundleAnalysisEnabled,
                pull: mockPullPageData,
              },
            },
          })
        )
      }),
      graphql.query('GetRepoSettings', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { repository: { private: false } },
          })
        )
      }),
      graphql.query('OwnerTier', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: { plan: { tierName: TierNames.PRO } },
          })
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
