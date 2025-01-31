import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { useSetUploadTokenRequired } from './useSetUploadTokenRequired'

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

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
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

describe('useSetUploadTokenRequired', () => {
  function setup({ isErrorResponse = false }) {
    const mockAddToast = vi.fn()
    mocks.useAddNotification.mockReturnValue(mockAddToast)

    server.use(
      graphql.mutation('SetUploadTokenRequired', () => {
        if (isErrorResponse) {
          return HttpResponse.json({
            data: {
              setUploadTokenRequired: {
                error: {
                  __typename: 'ValidationError',
                  message: 'Failed to set upload token requirement',
                },
              },
            },
          })
        }

        return HttpResponse.json({
          data: {
            setUploadTokenRequired: {
              error: null,
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
          const { result } = renderHook(
            () =>
              useSetUploadTokenRequired({
                provider: 'gh',
                owner: 'codecov',
              }),
            { wrapper }
          )

          result.current.mutate(true)

          await waitFor(() => result.current.isPending)
          await waitFor(() => !result.current.isPending)

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
          const data = result.current.data
          await waitFor(() =>
            expect(data).toEqual({
              data: {
                setUploadTokenRequired: {
                  error: null,
                },
              },
            })
          )
        })

        it('fires a success toast', async () => {
          const { mockAddToast } = setup({})

          const { result } = renderHook(
            () =>
              useSetUploadTokenRequired({
                provider: 'gh',
                owner: 'codecov',
              }),
            { wrapper }
          )

          result.current.mutate(true)

          await waitFor(() => result.current.isPending)
          await waitFor(() => !result.current.isPending)

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
          await waitFor(() =>
            expect(mockAddToast).toHaveBeenCalledWith({
              type: 'success',
              text: 'Upload token requirement updated successfully',
              disappearAfter: 10000,
            })
          )
        })
      })

      describe('on error', () => {
        it('fires an error toast', async () => {
          const { mockAddToast } = setup({ isErrorResponse: true })

          const { result } = renderHook(
            () =>
              useSetUploadTokenRequired({
                provider: 'gh',
                owner: 'codecov',
              }),
            { wrapper }
          )

          result.current.mutate(true)

          await waitFor(() => result.current.isPending)
          await waitFor(() => !result.current.isPending)

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
          await waitFor(() =>
            expect(mockAddToast).toHaveBeenCalledWith({
              type: 'error',
              text: 'Failed to set upload token requirement',
              disappearAfter: 10000,
            })
          )
        })
      })

      it('does not fire a success toast when isSuccess is falsy', async () => {
        const { mockAddToast } = setup({})

        const { result } = renderHook(
          () =>
            useSetUploadTokenRequired({
              provider: 'gh',
              owner: 'codecov',
            }),
          { wrapper }
        )

        result.current.mutate(false)
        await waitFor(() => expect(result.current.isSuccess).toBeFalsy())

        await waitFor(() =>
          expect(mockAddToast).not.toHaveBeenCalledWith({
            type: 'error',
            text: 'An error occurred while updating upload token requirement',
            disappearAfter: 10000,
          })
        )
      })
    })
  })
})
