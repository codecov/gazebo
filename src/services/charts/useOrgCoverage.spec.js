import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { setupServer } from 'msw/node'

import { orgCoverageHandler } from './mocks'

import { useOrgCoverage } from './index'

const queryClient = new QueryClient({})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

const exampleQuarterHookData = {
  coverage: [
    {
      date: '2020-04-01T00:00:00Z',
      totalHits: 4.0,
      totalMisses: 0.0,
      totalPartials: 0.0,
      totalLines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-07-01T00:00:00Z',
      totalHits: 4.0,
      totalMisses: 0.0,
      totalPartials: 0.0,
      totalLines: 4.0,
      coverage: 100.0,
    },
    {
      date: '2020-10-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-04-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-07-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
  ],
}

const exampleYearlyHookData = {
  coverage: [
    {
      date: '2020-01-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
    {
      date: '2021-01-01T00:00:00Z',
      totalHits: 41.0,
      totalMisses: 4.0,
      totalPartials: 0.0,
      totalLines: 45.0,
      coverage: 91.11,
    },
  ],
}

describe('useOrgCoverage', () => {
  beforeEach(() => {
    server.use(orgCoverageHandler)
  })

  describe('returns quarterly coverage data', () => {
    it('returns chart data', async () => {
      const { waitFor, result } = renderHook(
        () =>
          useOrgCoverage({
            provider: 'bitbucket',
            owner: 'critical role',
            query: { groupingUnit: 'quarterly' },
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => !result.current.isFetching)

      expect(result.current.data).toStrictEqual(exampleQuarterHookData)
    })
  })

  describe('returns year coverage data', () => {
    it('returns chart data', async () => {
      const { waitFor, result } = renderHook(
        () =>
          useOrgCoverage({
            provider: 'bitbucket',
            owner: 'critical role',
            query: { groupingUnit: 'yearly' },
          }),
        {
          wrapper,
        }
      )

      await waitFor(() => !result.current.isFetching)

      expect(result.current.data).toStrictEqual(exampleYearlyHookData)
    })
  })
})
