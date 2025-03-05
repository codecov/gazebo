import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateSelfHostedSettings } from './useUpdateSelfHostedSettings'

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
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProviderV5 client={queryClientV5}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/:provider">{children}</Route>
        </MemoryRouter>
      </QueryClientProvider>
    </QueryClientProviderV5>
  )

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  queryClientV5.clear()
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
    const mockAddToast = vi.fn()
    mocks.useAddNotification.mockReturnValue(mockAddToast)

    server.use(
      graphql.mutation('UpdateSelfHostedSettings', () => {
        if (isValidationError) {
          return HttpResponse.json({
            data: {
              updateSelfHostedSettings: {
                error: {
                  __typename: 'ValidationError',
                  message: 'validation error',
                },
              },
            },
          })
        }

        if (isUnauthenticatedError) {
          return HttpResponse.json({
            data: {
              updateSelfHostedSettings: {
                error: {
                  __typename: 'UnauthenticatedError',
                  message: 'unauthenticated error',
                },
              },
            },
          })
        }

        return HttpResponse.json({ data: { updateSelfHostedSettings: null } })
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

      await waitFor(() => expect(mockAddToast).not.toHaveBeenCalled())
    })
  })

  describe('when user is unauthenticated', () => {
    beforeAll(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      vi.restoreAllMocks()
    })

    it('returns an unauthenticated response', async () => {
      const { mockAddToast } = setup({ isUnauthenticatedError: true })
      const { result } = renderHook(() => useUpdateSelfHostedSettings(), {
        wrapper: wrapper(),
      })

      result.current.mutate({ shouldAutoActivate: false })

      await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
    })
  })

  describe('when there is a validation error', () => {
    beforeAll(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterAll(() => {
      vi.restoreAllMocks()
    })

    it('returns a validation error response', async () => {
      const { mockAddToast } = setup({ isValidationError: true })
      const { result } = renderHook(() => useUpdateSelfHostedSettings(), {
        wrapper: wrapper(),
      })

      result.current.mutate({ shouldAutoActivate: false })

      await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
    })
  })
})
