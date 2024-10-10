import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import MetricsSection from './MetricsSection'

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
      languages: ['typescript'],
      testAnalyticsEnabled: true,
    },
  },
}

const mockAggResponse = {
  owner: {
    repository: {
      __typename: 'Repository',
      testAnalytics: {
        testResultsAggregates: {
          totalDuration: 1.0,
          totalDurationPercentChange: 25.0,
          slowestTestsDuration: 111.11,
          slowestTestsDurationPercentChange: 0.0,
          totalFails: 1,
          totalFailsPercentChange: 100.0,
          totalSkips: 20,
          totalSkipsPercentChange: 0.0,
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
      suspense: false,
    },
  },
})

const wrapper: (initialEntries?: string) => React.FC<PropsWithChildren> =
  (initialEntries = '/gh/codecov/cool-repo/tests') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner/:repo/tests" exact>
          {children}
        </Route>
        <Route path="/:provider/:owner/:repo/tests/:branch" exact>
          {children}
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('MetricsSection', () => {
  function setup() {
    server.use(
      graphql.query('GetRepoOverview', (info) => {
        console.log('Mock for GetRepoOverview called')
        return HttpResponse.json({ data: mockOverview })
      }),
      graphql.query('GetTestResultsAggregates', (info) => {
        console.log('Mock for GetTestResultsAggregates called')
        return HttpResponse.json({ data: mockAggResponse })
      })
    )
  }

  describe('when on default branch', () => {
    it('renders subheaders', () => {
      setup()
      render(<MetricsSection />, {
        wrapper: wrapper('/gh/owner/repo/tests/main'),
      })

      const runEfficiency = screen.getByText('Improve CI Run Efficiency')
      const testPerf = screen.getByText('Improve Test Performance')
      expect(runEfficiency).toBeInTheDocument()
      expect(testPerf).toBeInTheDocument()
    })
  })
})
