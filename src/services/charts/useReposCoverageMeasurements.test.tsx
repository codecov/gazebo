import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useReposCoverageMeasurements } from './useReposCoverageMeasurements'

const mockReposMeasurements = {
  owner: {
    measurements: [
      {
        timestamp: '2023-01-01T00:00:00+00:00',
        avg: 85,
      },
      {
        timestamp: '2023-01-02T00:00:00+00:00',
        avg: 80,
      },
      {
        timestamp: '2023-01-03T00:00:00+00:00',
        avg: 90,
      },
      {
        timestamp: '2023-01-04T00:00:00+00:00',
        avg: 100,
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
  ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

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
      graphql.query('GetReposCoverageMeasurements', (info) => {
        if (hasNoData) {
          return HttpResponse.json({ data: {} })
        }

        return HttpResponse.json({ data: mockReposMeasurements })
      })
    )
  }

  describe('when called', () => {
    it('returns coverage information', async () => {
      setup({ hasNoData: false })

      const { result } = renderHook(
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
            avg: 85,
          },
          {
            timestamp: '2023-01-02T00:00:00+00:00',
            avg: 80,
          },
          {
            timestamp: '2023-01-03T00:00:00+00:00',
            avg: 90,
          },
          {
            timestamp: '2023-01-04T00:00:00+00:00',
            avg: 100,
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

        const { result } = renderHook(
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
