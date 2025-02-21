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

const mockSuccessResponse = { setUploadTokenRequired: { error: null } }

const mockErrorResponse = {
  setUploadTokenRequired: {
    error: {
      __typename: 'ValidationError',
      message: 'Failed to set upload token requirement',
    },
  },
}
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

interface SetupArgs {
  isErrorResponse?: boolean
  isParsingError?: boolean
}

describe('useSetUploadTokenRequired', () => {
  function setup({
    isErrorResponse = false,
    isParsingError = false,
  }: SetupArgs) {
    const mockAddToast = vi.fn()
    mocks.useAddNotification.mockReturnValue(mockAddToast)

    server.use(
      graphql.mutation('SetUploadTokenRequired', () => {
        if (isErrorResponse) {
          return HttpResponse.json({ data: mockErrorResponse })
        } else if (isParsingError) {
          return HttpResponse.json({ data: { owner: '' } })
        }

        return HttpResponse.json({ data: mockSuccessResponse })
      })
    )

    return { mockAddToast }
  }

  describe('when called', () => {
    describe('when calling the mutation', () => {
      describe('parsing error occurs', () => {
        it('rejects the promise', async () => {
          setup({ isParsingError: true })
          const { result } = renderHook(
            () =>
              useSetUploadTokenRequired({ provider: 'gh', owner: 'codecov' }),
            { wrapper }
          )

          let error: any
          try {
            await result.current.mutateAsync(true)
          } catch (e) {
            error = e
          }

          expect(error).toBeDefined()
          expect(error).toEqual({
            dev: 'useSetUploadTokenRequired - Parsing Error',
            status: 400,
          })
        })
      })

      describe('onSuccess', () => {
        describe('when the mutation is successful', () => {
          it('returns isSuccess true', async () => {
            setup({})
            const { result } = renderHook(
              () =>
                useSetUploadTokenRequired({ provider: 'gh', owner: 'codecov' }),
              { wrapper }
            )

            await result.current.mutateAsync(true)

            await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
            const data = result.current.data
            await waitFor(() =>
              expect(data).toEqual({ setUploadTokenRequired: { error: null } })
            )
          })

          it('fires a success toast', async () => {
            const { mockAddToast } = setup({})
            const { result } = renderHook(
              () =>
                useSetUploadTokenRequired({ provider: 'gh', owner: 'codecov' }),
              { wrapper }
            )

            await result.current.mutateAsync(true)

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

        describe('when the mutation is not successful', () => {
          it('fires an error toast', async () => {
            const { mockAddToast } = setup({ isErrorResponse: true })
            const { result } = renderHook(
              () =>
                useSetUploadTokenRequired({ provider: 'gh', owner: 'codecov' }),
              { wrapper }
            )

            await result.current.mutateAsync(true)

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
      })

      describe('onError', () => {
        it('fires an error toast', async () => {
          const { mockAddToast } = setup({})
          const { result } = renderHook(
            () =>
              useSetUploadTokenRequired({ provider: 'gh', owner: 'codecov' }),
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
})
