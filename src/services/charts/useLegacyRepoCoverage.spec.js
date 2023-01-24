import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { setupServer } from 'msw/node'

import { repoCoverageHandler } from './mocks'

import { useLegacyRepoCoverage } from './index'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

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

describe('useLegacyRepoCoverage', () => {
  beforeEach(() => {
    server.use(repoCoverageHandler)
  })

  describe('returns year coverage data', () => {
    it('returns chart data', async () => {
      const { waitFor, result } = renderHook(
        () =>
          useLegacyRepoCoverage({
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
