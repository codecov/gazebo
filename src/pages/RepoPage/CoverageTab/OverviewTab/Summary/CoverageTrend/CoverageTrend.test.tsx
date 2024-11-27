import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import CoverageTrend from './CoverageTrend'

vi.mock('../TrendDropdown', () => ({ default: () => 'TrendDropdown' }))

const mockOverview = {
  owner: {
    isCurrentUserActivated: true,
    repository: {
      __typename: 'Repository',
      private: false,
      defaultBranch: 'main',
      oldestCommitAt: '2022-10-10T11:59:59',
      coverageEnabled: true,
      bundleAnalysisEnabled: true,
      languages: ['javascript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockBranch = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: { name: 'main', head: { commitid: 'commit-123' } },
    },
  },
}

const mockBranches = {
  owner: {
    repository: {
      __typename: 'Repository',
      branches: {
        edges: [{ node: { name: 'main', head: { commitid: 'commit-123' } } }],
        pageInfo: { hasNextPage: false, endCursor: null },
      },
    },
  },
}

const mockBranchMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        measurements: [
          { timestamp: '2023-01-01T00:00:00+00:00', max: 40 },
          { timestamp: '2023-01-02T00:00:00+00:00', max: 80 },
          { timestamp: '2023-01-03T00:00:00+00:00', max: 90 },
          { timestamp: '2023-01-04T00:00:00+00:00', max: 100 },
        ],
      },
    },
  },
}

const mockNoBranchMeasurements = {
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        measurements: [],
      },
    },
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/test-org/test-repo']}>
      <Route path="/:provider/:owner/:repo">
        <Suspense fallback={null}>{children}</Suspense>
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
  hasBranchMeasurements?: boolean
}

describe('CoverageTrend', () => {
  function setup({ hasBranchMeasurements = true }: SetupArgs) {
    server.use(
      graphql.query('GetRepoOverview', () => {
        return HttpResponse.json({ data: mockOverview })
      }),
      graphql.query('GetBranches', () => {
        return HttpResponse.json({ data: mockBranches })
      }),
      graphql.query('GetBranch', () => {
        return HttpResponse.json({ data: mockBranch })
      }),
      graphql.query('GetBranchCoverageMeasurements', () => {
        if (!hasBranchMeasurements) {
          return HttpResponse.json({ data: mockNoBranchMeasurements })
        }

        return HttpResponse.json({ data: mockBranchMeasurements })
      })
    )
  }

  describe('coverage exists', () => {
    it('rendered the change %', async () => {
      setup({ hasBranchMeasurements: true })
      render(<CoverageTrend />, { wrapper })

      const change = await screen.findByText(/40.00%+/)
      expect(change).toBeInTheDocument()
    })
  })

  describe('coverage is empty', () => {
    it('does messages if there is no reports', async () => {
      setup({ hasBranchMeasurements: false })
      render(<CoverageTrend />, { wrapper })

      const message = await screen.findByText(
        /No coverage reports found in this timespan./
      )
      expect(message).toBeInTheDocument()
    })
  })
})
