import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { BundleChart } from './BundleChart'

const mockRepoOverview = {
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
      testAnalyticsEnabled: false,
    },
  },
}

const mockBundleTrendData = {
  owner: {
    repository: {
      __typename: 'Repository',
      branch: {
        head: {
          bundleAnalysis: {
            bundleAnalysisReport: {
              __typename: 'BundleAnalysisReport',
              bundle: {
                measurements: [
                  {
                    assetType: 'REPORT_SIZE',
                    measurements: [
                      {
                        timestamp: '2024-06-15T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-16T00:00:00+00:00',
                        avg: null,
                      },
                      {
                        timestamp: '2024-06-17T00:00:00+00:00',
                        avg: 6834699.8,
                      },
                      {
                        timestamp: '2024-06-18T00:00:00+00:00',
                        avg: 6822037.27273,
                      },
                      {
                        timestamp: '2024-06-19T00:00:00+00:00',
                        avg: 6824833.33333,
                      },
                      {
                        timestamp: '2024-06-20T00:00:00+00:00',
                        avg: 6812341,
                      },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
    },
  },
}

const queryClient = new QueryClient()
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={['/gh/codecov/test-repo/bundles/main/test-bundle']}
    >
      <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
        {children}
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

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

describe('BundleChart', () => {
  function setup() {
    server.use(
      graphql.query('GetBundleTrend', (info) => {
        return HttpResponse.json({ data: mockBundleTrendData })
      }),
      graphql.query('GetRepoOverview', (info) => {
        return HttpResponse.json({ data: mockRepoOverview })
      })
    )
  }

  it('renders placeholder while loading', () => {
    setup()
    render(<BundleChart />, { wrapper })

    const placeholder = screen.getByTestId('bundle-chart-placeholder')
    expect(placeholder).toBeInTheDocument()
  })

  it('renders the chart after loading', async () => {
    setup()
    render(<BundleChart />, { wrapper })

    const bundleChart = await screen.findByTestId('bundle-trend-chart')
    expect(bundleChart).toBeInTheDocument()
  })
})
