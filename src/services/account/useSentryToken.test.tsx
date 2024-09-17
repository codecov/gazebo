import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useSentryToken } from './useSentryToken'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('services/toastNotification', async () => {
  const original = await vi.importActual('services/toastNotification')
  return {
    ...original,
    useAddNotification: mocks.useAddNotification,
  }
})

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

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()
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

describe('useSentryToken', () => {
  function setup(
    {
      isValidationError = false,
      isUnAuthError = false,
      isUnknownError = false,
    }: {
      isValidationError?: boolean
      isUnAuthError?: boolean
      isUnknownError?: boolean
    } = {
      isValidationError: false,
      isUnAuthError: false,
      isUnknownError: false,
    }
  ) {
    const mockAddToast = vi.fn()
    mocks.useAddNotification.mockReturnValue(mockAddToast)
    const mockRemoveItem = vi.spyOn(window.localStorage.__proto__, 'removeItem')

    server.use(
      graphql.mutation('SendSentryToken', (info) => {
        if (isValidationError) {
          return HttpResponse.json({
            data: {
              saveSentryState: {
                error: {
                  __typename: 'ValidationError',
                  message: 'validation error',
                },
              },
            },
          })
        }

        if (isUnAuthError) {
          return HttpResponse.json({
            data: {
              saveSentryState: {
                error: {
                  __typename: 'UnauthenticatedError',
                  message: 'unauthenticatedError error',
                },
              },
            },
          })
        }

        if (isUnknownError) {
          return HttpResponse.json(
            { errors: [{ message: 'unknown error' }] },
            { status: 500 }
          )
        }

        return HttpResponse.json({ data: { saveSentryState: null } })
      })
    )

    return { mockAddToast, mockRemoveItem }
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('when called', () => {
    describe('when successful', () => {
      it('does not call addNotification', async () => {
        const { mockAddToast } = setup()
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockAddToast).not.toHaveBeenCalled())
      })

      it('removes item from local storage', async () => {
        const { mockRemoveItem } = setup()
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockRemoveItem).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockRemoveItem).toHaveBeenCalledWith('sentry-token')
        )
      })
    })

    describe('when validation error', () => {
      it('calls addNotification', async () => {
        const { mockAddToast } = setup({ isValidationError: true })
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockAddToast).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error', disappearAfter: 10000 })
          )
        )
      })

      it('removes item from local storage', async () => {
        const { mockRemoveItem } = setup({ isValidationError: true })
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockRemoveItem).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockRemoveItem).toHaveBeenCalledWith('sentry-token')
        )
      })
    })

    describe('when unauthenticated error', () => {
      it('calls addNotification', async () => {
        const { mockAddToast } = setup({ isUnAuthError: true })
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockAddToast).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error', disappearAfter: 10000 })
          )
        )
      })

      it('removes item from local storage', async () => {
        const { mockRemoveItem } = setup({ isUnAuthError: true })
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockRemoveItem).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockRemoveItem).toHaveBeenCalledWith('sentry-token')
        )
      })
    })

    describe('when unknown error', () => {
      it('calls addNotification', async () => {
        const { mockAddToast } = setup({ isUnknownError: true })
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockAddToast).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error', disappearAfter: 10000 })
          )
        )
      })

      it('removes item from local storage', async () => {
        const { mockRemoveItem } = setup({ isUnknownError: true })
        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          { wrapper }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockRemoveItem).toHaveBeenCalled())
        await waitFor(() =>
          expect(mockRemoveItem).toHaveBeenCalledWith('sentry-token')
        )
      })
    })
  })
})
