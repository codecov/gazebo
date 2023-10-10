import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import Chart from './Chart'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/bb/critical-role/bells-hells']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('Analytics coverage chart', () => {
  const mockSingleDataPoint = {
    owner: {
      measurements: [
        {
          timestamp: '2020-01-01T00:00:00Z',
          max: 91.11,
        },
      ],
    },
  }

  const mockDataPoints = {
    owner: {
      measurements: [
        {
          timestamp: '2020-01-01T00:00:00Z',
          max: 90.0,
        },
        {
          timestamp: '2021-01-01T00:00:00Z',
          max: 91.11,
        },
      ],
    },
  }

  function setup({ hasNoData = false, hasSingleData = false }) {
    server.use(
      graphql.query('GetReposCoverageMeasurements', (req, res, ctx) => {
        if (hasNoData) {
          return res(ctx.status(200), ctx.data({ owner: { measurements: [] } }))
        }

        if (hasSingleData) {
          return res(ctx.status(200), ctx.data(mockSingleDataPoint))
        }

        return res(ctx.status(200), ctx.data(mockDataPoints))
      })
    )
  }

  describe('No coverage data exists', () => {
    it('renders no chart', async () => {
      setup({ hasNoData: true })

      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
          }}
        />,
        {
          wrapper,
        }
      )

      const message = await screen.findByTitle('coverage chart')
      expect(message).toBeInTheDocument()
    })
  })

  describe('One data point', () => {
    it('Not enough data to render', async () => {
      setup({ hasSingleData: true })

      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
            repositories: [],
          }}
        />,
        {
          wrapper,
        }
      )

      const message = await screen.findByText(/Not enough data to render/)
      expect(message).toBeInTheDocument()
    })
  })

  describe('Chart with data', () => {
    it('renders victory', async () => {
      setup({ hasNoData: false, hasSingleData: false })

      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
            repositories: [],
          }}
        />,
        {
          wrapper,
        }
      )

      const img = await screen.findByRole('img')
      expect(img).toBeInTheDocument(0)
    })

    it('renders a screen reader friendly description', async () => {
      setup({ hasNoData: false, hasSingleData: false })

      render(
        <Chart
          params={{
            startDate: '2020-01-15',
            endDate: '2020-01-19',
            repositories: ['api', 'frontend'],
          }}
        />,
        {
          wrapper,
        }
      )

      const message = await screen.findByText(
        'api, frontend coverage chart from Jan 01, 2020 to Jan 01, 2021, coverage change is +90%'
      )
      expect(message).toBeInTheDocument()
    })
  })
})
