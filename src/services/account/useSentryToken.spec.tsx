import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { PropsWithChildren } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import { useSentryToken } from './useSentryToken'

jest.mock('services/toastNotification')

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
const server = setupServer()

const wrapper: React.FC<PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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
    //@ts-ignore
    const mockAddToast = jest.fn()

    //@ts-ignore
    useAddNotification.mockReturnValue(mockAddToast)

    const mockRemoveItem = jest.spyOn(
      window.localStorage.__proto__,
      'removeItem'
    )

    server.use(
      graphql.mutation('SendSentryToken', (req, res, ctx) => {
        if (isValidationError) {
          return res(
            ctx.status(200),
            ctx.data({
              saveSentryState: {
                error: {
                  __typename: 'ValidationError',
                  message: 'validation error',
                },
              },
            })
          )
        }

        if (isUnAuthError) {
          return res(
            ctx.status(200),
            ctx.data({
              saveSentryState: {
                error: {
                  __typename: 'UnauthenticatedError',
                  message: 'unauthenticatedError error',
                },
              },
            })
          )
        }

        if (isUnknownError) {
          return res(
            ctx.status(500),
            ctx.errors([{ message: 'unknown error' }])
          )
        }

        return res(ctx.status(200), ctx.data({ saveSentryState: null }))
      })
    )

    return { mockAddToast, mockRemoveItem }
  }

  afterEach(() => jest.resetAllMocks)

  describe('when called', () => {
    describe('when successful', () => {
      it('does not call addNotification', async () => {
        const { mockAddToast } = setup()

        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          {
            wrapper,
          }
        )

        result.current.mutate('super-cool-token')

        await waitFor(() => expect(mockAddToast).not.toHaveBeenCalled())
      })

      it('removes item from local storage', async () => {
        const { mockRemoveItem } = setup()

        const { result } = renderHook(
          () => useSentryToken({ provider: '/gh' }),
          {
            wrapper,
          }
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
          {
            wrapper,
          }
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
          {
            wrapper,
          }
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
          {
            wrapper,
          }
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
          {
            wrapper,
          }
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
          {
            wrapper,
          }
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
          {
            wrapper,
          }
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
