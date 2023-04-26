import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useReposCoverageMeasurements } from './useReposCoverageMeasurements'

const mockReposMeasurements = {
  owner: {
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
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (): React.FC<React.PropsWithChildren> =>
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

describe('useReposCoverageMeasurements', () => {
  function setup({ hasNoData = false }: { hasNoData: boolean }) {
    server.use(
      graphql.query('GetReposCoverageMeasurements', (req, res, ctx) => {
        if (hasNoData) {
          return res(ctx.status(200), ctx.data({}))
        }

        return res(ctx.status(200), ctx.data(mockReposMeasurements))
      })
    )
  }

  describe('when called', () => {
    it('returns coverage information', async () => {
      setup({ hasNoData: false })

      const { result, waitFor } = renderHook(
        () =>
          useReposCoverageMeasurements({
            provider: 'gh',
            owner: 'codecov',
            interval: 'INTERVAL_7_DAY',
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

    describe('no data is returned from the API', () => {
      it('returns an empty object', async () => {
        setup({ hasNoData: true })

        const { result, waitFor } = renderHook(
          () =>
            useReposCoverageMeasurements({
              provider: 'gh',
              owner: 'codecov',
              interval: 'INTERVAL_7_DAY',
            }),
          { wrapper: wrapper() }
        )

        await waitFor(() => expect(result.current.data).toStrictEqual({}))
      })
    })
  })
})
