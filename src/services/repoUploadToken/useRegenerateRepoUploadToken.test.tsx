import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRegenerateRepoUploadToken } from './useRegenerateRepoUploadToken'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('services/toastNotification', async () => {
  const actual = await vi.importActual('services/toastNotification')
  return {
    ...actual,
    useAddNotification: mocks.useAddNotification,
  }
})

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo']}>
    <Route path="/:provider/:owner/:repo">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useRegenerateRepoUploadToken', () => {
  function setup({ isErrorResponse = false }) {
    const mockAddToast = vi.fn()
    mocks.useAddNotification.mockReturnValue(mockAddToast)

    server.use(
      graphql.mutation('RegenerateRepositoryUploadToken', () => {
        if (isErrorResponse) {
          return HttpResponse.json({
            data: {
              regenerateRepositoryUploadToken: {
                error: {
                  __typename: 'ValidationError',
                },
              },
            },
          })
        }

        return HttpResponse.json({
          data: {
            regenerateRepositoryUploadToken: {
              token: 'repo-token',
            },
          },
        })
      })
    )

    return { mockAddToast }
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({})
    })

    describe('when calling the mutation', () => {
      describe('when successful', () => {
        it('returns isSuccess true', async () => {
          const { result } = renderHook(() => useRegenerateRepoUploadToken(), {
            wrapper,
          })

          result.current.mutate()

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
          const data = result.current.data
          await waitFor(() =>
            expect(data).toEqual({
              data: {
                regenerateRepositoryUploadToken: {
                  token: 'repo-token',
                },
              },
            })
          )
        })
      })

      describe('on error', () => {
        it('fires a toast', async () => {
          const { mockAddToast } = setup({ isErrorResponse: true })

          const { result } = renderHook(() => useRegenerateRepoUploadToken(), {
            wrapper,
          })

          result.current.mutate()

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
          await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
        })
      })
    })
  })
})
