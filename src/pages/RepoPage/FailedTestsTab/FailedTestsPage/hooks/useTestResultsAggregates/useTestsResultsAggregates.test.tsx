import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { MockInstance } from 'vitest'

import { useTestResultsAggregates } from './useTestResultsAggregates'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

const mockNotFoundError = {
  owner: {
    repository: {
      __typename: 'NotFoundError',
      message: 'repo not found',
    },
    plan: {
      value: 'users-basic',
    },
  },
}

const mockIncorrectResponse = {
  owner: {
    repository: {
      invalid: 'invalid',
    },
    plan: {
      value: 'users-basic',
    },
  },
}

const mockResponse = {
  owner: {
    plan: {
      value: 'users-basic',
    },
    repository: {
      __typename: 'Repository',
      private: true,
      defaultBranch: 'main',
      testAnalytics: {
        testResultsAggregates: {
          totalDuration: 1.0,
          totalDurationPercentChange: 25.0,
          slowestTestsDuration: 111.11,
          slowestTestsDurationPercentChange: 0.0,
          totalSlowTests: 2,
          totalSlowTestsPercentChange: 15.1,
          totalFails: 1,
          totalFailsPercentChange: 100.0,
          totalSkips: 20,
          totalSkipsPercentChange: 0.0,
        },
      },
    },
  },
}

describe('useTestResultsAggregates', () => {
  function setup({
    isNotFoundError = false,
    isUnsuccessfulParseError = false,
  }) {
    server.use(
      graphql.query('GetTestResultsAggregates', (info) => {
        if (isNotFoundError) {
          return HttpResponse.json({ data: mockNotFoundError })
        } else if (isUnsuccessfulParseError) {
          return HttpResponse.json({ data: mockIncorrectResponse })
        }
        return HttpResponse.json({ data: mockResponse })
      })
    )
  }

  describe('when called with successful res', () => {
    describe('when data is loaded', () => {
      it('returns the data', async () => {
        setup({})
        const { result } = renderHook(() => useTestResultsAggregates(), {
          wrapper,
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toEqual({
            testResultsAggregates: {
              totalDuration: 1,
              totalDurationPercentChange: 25,
              slowestTestsDuration: 111.11,
              slowestTestsDurationPercentChange: 0,
              totalFails: 1,
              totalFailsPercentChange: 100,
              totalSlowTests: 2,
              totalSlowTestsPercentChange: 15.1,
              totalSkips: 20,
              totalSkipsPercentChange: 0,
            },
            plan: 'users-basic',
            private: true,
            defaultBranch: 'main',
          })
        )
      })
    })
  })

  describe('when failed to parse data', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns a failed to parse error', async () => {
      setup({ isUnsuccessfulParseError: true })
      const { result } = renderHook(() => useTestResultsAggregates(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            dev: 'useTestResultsAggregates - 404 Failed to parse data',
          })
        )
      )
    })
  })

  describe('when data not found', () => {
    let consoleSpy: MockInstance
    beforeAll(() => {
      consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      consoleSpy.mockRestore()
    })

    it('returns a not found error', async () => {
      setup({ isNotFoundError: true })
      const { result } = renderHook(() => useTestResultsAggregates(), {
        wrapper,
      })

      await waitFor(() =>
        expect(result.current.error).toEqual(
          expect.objectContaining({
            status: 404,
            data: {},
          })
        )
      )
    })
  })
})
