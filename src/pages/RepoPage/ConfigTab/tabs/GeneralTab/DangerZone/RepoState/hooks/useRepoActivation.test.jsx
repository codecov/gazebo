import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useRepoActivation } from './useRepoActivation'

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
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/config']}>
      <Route path="/:provider/:owner/:repo/config">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => {
  server.listen()
  console.error = () => {}
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useRepoActivation', () => {
  const mutate = vi.fn()
  const addNotification = vi.fn()

  function setup({ failMutation = false } = {}) {
    server.use(
      http.patch('/internal/github/codecov/repos/codecov-client/', () => {
        mutate()

        if (failMutation) {
          return HttpResponse.error(500)
        }

        return HttpResponse.json({})
      })
    )

    mocks.useAddNotification.mockReturnValue(addNotification)
  }

  describe('when mutation is successful', () => {
    beforeEach(() => setup())

    it('toggles the repo state', async () => {
      const { result } = renderHook(() => useRepoActivation(), { wrapper })

      result.current.toggleRepoState(true)

      await waitFor(() => expect(mutate).toHaveBeenCalled())
      expect(result.current.variables).toStrictEqual({ activated: false })
    })
  })

  describe('when mutation is not successful', () => {
    beforeEach(() => setup({ failMutation: true }))

    it('displays a toast notification on error', async () => {
      const { result } = renderHook(() => useRepoActivation(), { wrapper })

      result.current.toggleRepoState(false)

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'We were not able to activate this repo',
        })
      )
    })
  })
})
