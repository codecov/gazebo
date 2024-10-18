import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import MockResizeObserver from 'resize-observer-polyfill'

import { BundleChart, formatDate } from './BundleChart'

global.ResizeObserver = MockResizeObserver

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
                    assetType: 'JAVASCRIPT_SIZE',
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
                  {
                    assetType: 'IMAGE_SIZE',
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true, retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter
      initialEntries={['/gh/codecov/test-repo/bundles/main/test-bundle']}
    >
      <Route path="/:provider/:owner/:repo/bundles/:branch/:bundle">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
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

  it('renders placeholder while loading', async () => {
    setup()
    render(<BundleChart />, { wrapper })

    const placeholder = await screen.findByTestId('bundle-chart-placeholder')
    expect(placeholder).toBeInTheDocument()
  })

  it('renders the chart after loading', async () => {
    setup()
    render(<BundleChart />, { wrapper })

    const bundleChart = await screen.findByTestId('chart-container')
    expect(bundleChart).toBeInTheDocument()
  })
})

describe('formatDate', () => {
  it('formats the date correctly', () => {
    expect(formatDate('2024-06-15T00:00:00+00:00')).toBe('Jun 15, 2024')
  })
})
