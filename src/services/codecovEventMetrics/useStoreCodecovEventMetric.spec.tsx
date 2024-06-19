import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useStoreCodecovEventMetric } from './useStoreCodecovEventMetric'

const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      retry: false,
    },
    queries: {
      retry: false,
    },
  },
  logger: {
    error: () => null,
    warn: () => null,
    log: () => null,
  },
})

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' })
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('useStoreCodecovEventMetric', () => {
  function setup() {
    const mockSetItem = jest.spyOn(window.localStorage.__proto__, 'setItem')
    const mockGetItem = jest.spyOn(window.localStorage.__proto__, 'getItem')

    server.use(
      graphql.mutation('storeEventMetric', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ storeEventMetric: null }))
      })
    )

    return { mockSetItem, mockGetItem }
  }

  afterEach(() => jest.resetAllMocks())

  describe('when called', () => {
    describe('when successful', () => {
      it('calls the mutation fn', async () => {
        setup()
        const { result } = renderHook(() => useStoreCodecovEventMetric(), {
          wrapper,
        })

        result.current.mutate({
          owner: 'codecov',
          event: 'CLICKED_BUTTON',
          jsonPayload: {},
        })

        await waitFor(() =>
          expect(result.current.data).toEqual({
            data: {
              storeEventMetric: null,
            },
          })
        )
      })

      it('sets metric in local storage', async () => {
        const { mockSetItem, mockGetItem } = setup()
        const { result } = renderHook(() => useStoreCodecovEventMetric(), {
          wrapper,
        })

        result.current.mutate({
          owner: 'codecov',
          event: 'CLICKED_BUTTON',
          jsonPayload: {},
        })

        await waitFor(() => expect(mockGetItem).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockSetItem).toHaveBeenCalledWith(
            'UserOnboardingMetricsStored',
            '["codecov|CLICKED_BUTTON|{}"]'
          )
        )
      })
    })

    describe('metric exists in localstorage', () => {
      it('does not fire mutation', async () => {
        const { mockSetItem, mockGetItem } = setup()

        const { result } = renderHook(() => useStoreCodecovEventMetric(), {
          wrapper,
        })

        const metric = {
          owner: 'codecov',
          event: 'CLICKED_BUTTON',
          jsonPayload: {},
        }
        mockGetItem.mockReturnValue(JSON.stringify(metric))

        result.current.mutate(metric)

        await waitFor(() => expect(mockGetItem).toHaveBeenCalled())
        await waitFor(() => expect(mockSetItem).not.toHaveBeenCalled())
      })
    })

    describe('when local storage has more than 30 entries', () => {
      it('removes the oldest entry and adds the new metric', async () => {
        const { mockSetItem, mockGetItem } = setup()

        const mockMetrics = Array.from({ length: 31 }, (_, i) => `metric${i}`)
        const stringMockMetrics = JSON.stringify(mockMetrics)
        mockGetItem.mockReturnValue(stringMockMetrics)

        const { result } = renderHook(() => useStoreCodecovEventMetric(), {
          wrapper,
        })

        const newMetric = {
          owner: 'codecov',
          event: 'NEW_EVENT',
          jsonPayload: {},
        }

        result.current.mutate(newMetric)

        await waitFor(() => expect(mockGetItem).toHaveBeenCalled())
        await waitFor(() => {
          const updatedMetrics = [
            ...mockMetrics.slice(1),
            'codecov|NEW_EVENT|{}',
          ]
          expect(mockSetItem).toHaveBeenCalledWith(
            'UserOnboardingMetricsStored',
            JSON.stringify(updatedMetrics)
          )
        })
      })
    })
  })
})
