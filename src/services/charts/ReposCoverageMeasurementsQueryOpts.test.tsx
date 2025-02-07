import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { type MockInstance } from 'vitest'

import { ReposCoverageMeasurementsQueryOpts } from './ReposCoverageMeasurementsQueryOpts'

const mockReposMeasurements = {
  owner: {
    measurements: [
      { timestamp: '2023-01-01T00:00:00+00:00', avg: 85 },
      { timestamp: '2023-01-02T00:00:00+00:00', avg: 80 },
      { timestamp: '2023-01-03T00:00:00+00:00', avg: 90 },
      { timestamp: '2023-01-04T00:00:00+00:00', avg: 100 },
    ],
  },
}

const server = setupServer()
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      {children}
    </QueryClientProviderV5>
  )

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  hasNoData?: boolean
  hasParsingError?: boolean
}

describe('useReposCoverageMeasurements', () => {
  function setup({ hasNoData = false, hasParsingError = false }: SetupArgs) {
    server.use(
      graphql.query('GetReposCoverageMeasurements', () => {
        if (hasNoData) {
          return HttpResponse.json({ data: { owner: null } })
        } else if (hasParsingError) {
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
          useQueryV5(
            ReposCoverageMeasurementsQueryOpts({
              provider: 'gh',
              owner: 'codecov',
              interval: 'INTERVAL_7_DAY',
            })
          ),
        { wrapper: wrapper() }
      )

      const expectedData = {
        measurements: [
          { timestamp: '2023-01-01T00:00:00+00:00', avg: 85 },
          { timestamp: '2023-01-02T00:00:00+00:00', avg: 80 },
          { timestamp: '2023-01-03T00:00:00+00:00', avg: 90 },
          { timestamp: '2023-01-04T00:00:00+00:00', avg: 100 },
        ],
      }

      await waitFor(() =>
        expect(result.current.data).toStrictEqual(expectedData)
      )
    })

    describe('no data is returned from the API', () => {
      it('returns an empty array', async () => {
        setup({ hasNoData: true })

        const { result } = renderHook(
          () =>
            useQueryV5(
              ReposCoverageMeasurementsQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                interval: 'INTERVAL_7_DAY',
              })
            ),
          { wrapper: wrapper() }
        )

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            measurements: [],
          })
        )
      })
    })

    describe('parsing error', () => {
      let consoleSpy: MockInstance

      beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => null)
      })

      afterEach(() => {
        consoleSpy.mockRestore()
      })

      it('rejects the promise', async () => {
        setup({ hasParsingError: true })

        const { result } = renderHook(
          () =>
            useQueryV5(
              ReposCoverageMeasurementsQueryOpts({
                provider: 'gh',
                owner: 'codecov',
                interval: 'INTERVAL_7_DAY',
              })
            ),
          { wrapper: wrapper() }
        )

        await waitFor(() => expect(result.current.isError).toBeTruthy())
        await waitFor(() =>
          expect(result.current.error).toEqual(
            expect.objectContaining({
              status: 404,
            })
          )
        )
      })
    })
  })
})
