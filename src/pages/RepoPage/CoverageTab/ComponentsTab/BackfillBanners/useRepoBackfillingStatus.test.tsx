import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoBackfillingStatus } from './useRepoBackfillingStatus'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh/codecov/test'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <MemoryRouter initialEntries={[initialEntries]}>
      <Route path="/:provider/:owner/:repo">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </Route>
    </MemoryRouter>
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

const mockBackfillComplete = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: true,
      },
    },
  },
}

const mockBackfillInProgress = {
  config: {
    isTimescaleEnabled: true,
  },
  owner: {
    repository: {
      __typename: 'Repository',
      coverageAnalytics: {
        componentsMeasurementsActive: true,
        componentsMeasurementsBackfilled: false,
      },
    },
  },
}

describe('BackfillComponentMemberships', () => {
  function setup(data = mockBackfillComplete) {
    server.use(
      graphql.query('BackfillComponentMemberships', (info) => {
        return HttpResponse.json({ data })
      })
    )
  }

  describe('when backfilling is done', () => {
    it('returns data accordingly', async () => {
      setup()
      const { result } = renderHook(() => useRepoBackfillingStatus(), {
        wrapper: wrapper(),
      })

      await waitFor(() =>
        expect(result.current).toEqual({
          componentsMeasurementsActive: true,
          componentsMeasurementsBackfilled: true,
          isRepoBackfilling: false,
          isTimescaleEnabled: true,
        })
      )
    })
  })

  describe('when backfilling is not done', () => {
    it('returns data accordingly', async () => {
      setup(mockBackfillInProgress)
      const { result } = renderHook(() => useRepoBackfillingStatus(), {
        wrapper: wrapper(),
      })
      await waitFor(() =>
        expect(result.current).toEqual({
          componentsMeasurementsActive: true,
          componentsMeasurementsBackfilled: false,
          isRepoBackfilling: true,
          isTimescaleEnabled: true,
        })
      )
    })
  })
})
