import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'

import { useUpdateSelfHostedSettings } from './useUpdateSelfHostedSettings'

jest.mock('services/toastNotification')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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

describe('updateSelfHostedSettings', () => {
  function setup({
    isValidationError = false,
    isUnauthenticatedError = false,
  }) {
    const mockAddToast = jest.fn()

    //@ts-ignore
    useAddNotification.mockReturnValue(mockAddToast)
    server.use(
      graphql.mutation('UpdateSelfHostedSettings', (req, res, ctx) => {
        if (isValidationError) {
          return res(
            ctx.status(200),
            ctx.data({
              updateSelfHostedSettings: {
                error: {
                  __typename: 'ValidationError',
                  message: 'validation error',
                },
              },
            })
          )
        }

        if (isUnauthenticatedError) {
          return res(
            ctx.status(200),
            ctx.data({
              updateSelfHostedSettings: {
                error: {
                  __typename: 'UnauthenticatedError',
                  message: 'unauthenticated error',
                },
              },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.data({ updateSelfHostedSettings: null })
        )
      })
    )
    return { mockAddToast }
  }

  describe('when called', () => {
    it('calls with the correct body', async () => {
      const { mockAddToast } = setup({})
      const { result } = renderHook(() => useUpdateSelfHostedSettings(), {
        wrapper: wrapper(),
      })

      result.current.mutate({ shouldAutoActivate: false })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)
      expect(mockAddToast).not.toHaveBeenCalled()
    })
  })

  describe('when user is unauthenticated', () => {
    it('returns an unauthenticated response', async () => {
      const { mockAddToast } = setup({ isUnauthenticatedError: true })
      const { result } = renderHook(() => useUpdateSelfHostedSettings(), {
        wrapper: wrapper(),
      })
      result.current.mutate({ shouldAutoActivate: false })
      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      expect(mockAddToast).toHaveBeenCalled()
    })
  })

  describe('when there is a validation error', () => {
    it('returns a validation error response', async () => {
      const { mockAddToast } = setup({ isValidationError: true })

      const { result } = renderHook(() => useUpdateSelfHostedSettings(), {
        wrapper: wrapper(),
      })

      result.current.mutate({ shouldAutoActivate: false })

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)
      expect(mockAddToast).toHaveBeenCalled()
    })
  })
})
