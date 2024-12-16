import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import Chart, { formatDate } from './Chart'

declare global {
  interface Window {
    ResizeObserver: unknown
  }
}

vi.mock('recharts', async () => {
  const OriginalModule = await vi.importActual('recharts')
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      // @ts-expect-error - something is off with the import actual but this does exist, and this mock does work
      <OriginalModule.ResponsiveContainer width={800} height={800}>
        {children}
      </OriginalModule.ResponsiveContainer>
    ),
  }
})

const mockSingleDataPoint = {
  owner: {
    measurements: [{ timestamp: '2020-01-01T00:00:00Z', avg: 91.11 }],
  },
}

const mockDataPoints = {
  owner: {
    measurements: [
      { timestamp: '2020-01-01T00:00:00Z', avg: 90.0 },
      { timestamp: '2021-01-01T00:00:00Z', avg: 91.11 },
    ],
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

let resizeObserverMock: Mock
beforeEach(() => {
  /**
   * ResizeObserver is not available, so we have to create a mock to avoid error coming
   * from `react-resize-detector`.
   * @see https://github.com/maslianok/react-resize-detector/issues/145
   *
   * This mock also allow us to use {@link notifyResizeObserverChange} to fire changes
   * from inside our test.
   */
  resizeObserverMock = vi.fn().mockImplementation((_callback) => {
    return {
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }
  })

  // @ts-expect-error - deleting so we can override with the mock
  delete window.ResizeObserver

  window.ResizeObserver = resizeObserverMock
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  hasNoData?: boolean
  hasSingleData?: boolean
  hasError?: boolean
}

describe('Analytics coverage chart', () => {
  function setup({
    hasNoData = false,
    hasSingleData = false,
    hasError = false,
  }: SetupArgs) {
    server.use(
      graphql.query('GetReposCoverageMeasurements', () => {
        if (hasNoData) {
          return HttpResponse.json({ data: { owner: { measurements: [] } } })
        } else if (hasSingleData) {
          return HttpResponse.json({ data: mockSingleDataPoint })
        } else if (hasError) {
          return HttpResponse.json({ errors: ['error'] }, { status: 500 })
        }

        return HttpResponse.json({ data: mockDataPoints })
      }),
      graphql.query('OwnerTier', () =>
        HttpResponse.json({ data: { owner: { plan: { tierName: 'pro' } } } })
      )
    )
  }

  it('renders data label', async () => {
    setup({})
    render(
      <Chart
        startDate={new Date('2020-01-15')}
        endDate={new Date('2020-01-19')}
        repositories={[]}
      />,
      { wrapper }
    )

    const label = await screen.findByText(/Data is average of selected repos/)
    expect(label).toBeInTheDocument()
  })

  describe('renders the chart', () => {
    it('renders the chart', async () => {
      setup({})
      render(
        <Chart
          startDate={new Date('2020-01-15')}
          endDate={new Date('2020-01-19')}
          repositories={[]}
        />,
        { wrapper }
      )

      const chart = await screen.findByTestId('chart-container')
      expect(chart).toBeInTheDocument()
    })

    it('renders the legend', async () => {
      setup({})
      render(
        <Chart
          startDate={new Date('2020-01-15')}
          endDate={new Date('2020-01-19')}
          repositories={[]}
        />,
        { wrapper }
      )

      const legend = await screen.findByTestId('chart-legend-content')
      expect(legend).toBeInTheDocument()

      const coverage = await within(legend).findByText('Coverage')
      expect(coverage).toBeInTheDocument()
    })
  })

  describe('no coverage data exists', () => {
    it('renders not enough data message', async () => {
      setup({ hasNoData: true })
      render(
        <Chart
          startDate={new Date('2020-01-15')}
          endDate={new Date('2020-01-19')}
          repositories={[]}
        />,
        { wrapper }
      )

      const message = await screen.findByText(
        'Not enough coverage data to display chart.'
      )
      expect(message).toBeInTheDocument()
    })
  })

  describe('fails to load', () => {
    it('renders error message', async () => {
      setup({ hasError: true })
      render(
        <Chart
          startDate={new Date('2020-01-15')}
          endDate={new Date('2020-01-19')}
          repositories={[]}
        />,
        { wrapper }
      )

      const message = await screen.findByText(
        'The coverage chart failed to load.'
      )
      expect(message).toBeInTheDocument()
    })
  })
})

describe('formatDate', () => {
  it('formats the date', () => {
    expect(formatDate('2020-01-01')).toBe('Jan 1, 2020')
  })
})
