import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEncodeString } from './useEncodeString'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('services/toastNotification', async () => {
  const original = await import('services/toastNotification')
  return {
    ...original,
    useAddNotification: mocks.useAddNotification,
  }
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/config']}>
    <Route path="/:provider/:owner/:repo/config">
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

describe('useEncodeString', () => {
  function setup({ isErrorResponse = false }) {
    const mockAddToast = vi.fn()
    mocks.useAddNotification.mockReturnValue(mockAddToast)

    server.use(
      graphql.mutation('EncodeSecretString', (info) => {
        if (isErrorResponse) {
          return HttpResponse.json({
            data: {
              encodeSecretString: {
                error: {
                  __typename: 'ValidationError',
                },
              },
            },
          })
        }
        return HttpResponse.json({
          data: {
            encodeSecretString: {
              value: 'encoded-string',
            },
          },
        })
      })
    )
    return { mockAddToast }
  }

  describe('when called', () => {
    describe('when calling the mutation', () => {
      describe('when successful', () => {
        it('returns isSuccess true', async () => {
          setup({})
          const { result } = renderHook(() => useEncodeString(), {
            wrapper,
          })

          result.current.mutate('dummy')

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
          const data = result.current.data
          await waitFor(() =>
            expect(data).toEqual({
              data: {
                encodeSecretString: {
                  value: 'encoded-string',
                },
              },
            })
          )
        })
      })

      describe('on error', () => {
        it('fires a toast', async () => {
          const { mockAddToast } = setup({ isErrorResponse: true })

          const { result } = renderHook(() => useEncodeString(), {
            wrapper,
          })

          result.current.mutate('dummy')

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
          await waitFor(() => expect(mockAddToast).toHaveBeenCalled())
        })
      })
    })
  })
})
