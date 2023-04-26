import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useBranchCoverageMeasurements } from './useBranchCoverageMeasurements'

const mockBranchMeasurements = {
  owner: {
    repository: {
      measurements: [
        {
          timestamp: '2023-01-01T00:00:00+00:00',
          max: 85,
        },
        {
          timestamp: '2023-01-02T00:00:00+00:00',
          max: 80,
        },
        {
          timestamp: '2023-01-03T00:00:00+00:00',
          max: 90,
        },
        {
          timestamp: '2023-01-04T00:00:00+00:00',
          max: 100,
        },
      ],
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  () =>
  ({ children }) =>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('useBranchCoverageMeasurements', () => {
  function setup() {
    server.use(
      graphql.query('GetBranchCoverageMeasurements', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockBranchMeasurements))
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    it('returns coverage information', async () => {
      const { result, waitFor } = renderHook(
        () =>
          useBranchCoverageMeasurements({
            provider: 'gh',
            owner: 'codecov',
            repo: 'cool-repo',
            interval: 'INTERVAL_7_DAY',
            before: new Date('2023/03/02'),
            after: new Date('2022/03/02'),
            branch: 'main',
          }),
        { wrapper: wrapper() }
      )

      const expectedData = {
        measurements: [
          {
            timestamp: '2023-01-01T00:00:00+00:00',
            max: 85,
          },
          {
            timestamp: '2023-01-02T00:00:00+00:00',
            max: 80,
          },
          {
            timestamp: '2023-01-03T00:00:00+00:00',
            max: 90,
          },
          {
            timestamp: '2023-01-04T00:00:00+00:00',
            max: 100,
          },
        ],
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedData)
      )
    })
  })
})
