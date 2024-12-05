import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useDeleteFlag } from './useDeleteFlag'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('services/toastNotification', async () => {
  const originalModule = await vi.importActual('services/toastNotification')
  return {
    ...originalModule,
    useAddNotification: mocks.useAddNotification,
  }
})

const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const ownerUsername = 'vox-machina'
const repoName = 'vestiges'

const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={[`/gh/${ownerUsername}/${repoName}/flags`]}>
    <Route path="/:provider/:owner/:repo/flags">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

describe('useDeleteFlag', () => {
  function setup(data = {}, triggerError = false) {
    server.use(
      graphql.mutation('deleteFlag', () => {
        if (triggerError) {
          return HttpResponse.json({ errors: [] }, { status: 500 })
        } else {
          return HttpResponse.json({ data })
        }
      })
    )

    const addNotification = vi.fn()

    mocks.useAddNotification.mockReturnValue(addNotification)

    return { addNotification }
  }

  describe('when called without an error', () => {
    beforeEach(() => {
      setup({ deleteFlag: { ownerUsername, repoName, flagName: 'flag-123' } })
    })

    describe('When mutation is a success', () => {
      it('returns successful response', async () => {
        const { result } = renderHook(() => useDeleteFlag(), {
          wrapper,
        })
        result.current.mutate({ flagName: 'flag-123' })

        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })

  describe('when called with a validation error', () => {
    describe('When mutation is a success w/ a validation error', () => {
      it('adds an error notification', async () => {
        const mockData = {
          deleteFlag: {
            error: {
              __typename: 'ValidationError',
            },
          },
        }
        const { addNotification } = setup(mockData)
        const { result } = renderHook(() => useDeleteFlag(), {
          wrapper,
        })
        result.current.mutate({ flagName: 'random-flag-123' })

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'There was an error deleting your flag',
          })
        )
      })
    })

    describe('When mutation is not successful', () => {
      it('adds an error notification', async () => {
        const mockData = {
          deleteFlag: {
            error: {
              __typename: 'ValidationError',
            },
          },
        }
        const triggerError = true
        const { addNotification } = setup(mockData, triggerError)
        const { result } = renderHook(() => useDeleteFlag(), {
          wrapper,
        })
        result.current.mutate({ flagName: 'random-flag-123' })

        await waitFor(() =>
          expect(addNotification).toHaveBeenCalledWith({
            type: 'error',
            text: 'There was an error deleting your flag',
          })
        )
      })
    })
  })
})
