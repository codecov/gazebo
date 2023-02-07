import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { waitFor } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import { act } from 'react-test-renderer'

import { useAddNotification } from 'services/toastNotification'

import { useRepoActivation } from './useRepoActivation'

jest.mock('services/toastNotification')

const queryClient = new QueryClient()
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/codecov-client/settings']}>
      <Route path="/:provider/:owner/:repo/settings">{children}</Route>
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
  const mutate = jest.fn()
  const addNotification = jest.fn()

  function setup({ failMutation = false } = {}) {
    server.use(
      rest.patch(
        '/internal/github/codecov/repos/codecov-client/',
        (req, res, ctx) => {
          mutate()

          if (failMutation) {
            return res(ctx.status(500))
          }

          return res(ctx.status(200), ctx.json({}))
        }
      )
    )

    useAddNotification.mockReturnValue(addNotification)
  }

  describe('when mutation is successful', () => {
    beforeEach(() => setup())

    it('toggles the repo state', async () => {
      const { result } = renderHook(() => useRepoActivation(), { wrapper })

      await act(async () => {
        result.current.toggleRepoState(true)
      })

      await waitFor(() => expect(mutate).toBeCalled())
      expect(result.current.variables).toStrictEqual({ activated: false })
    })
  })

  describe('when mutation is not successful', () => {
    beforeEach(() => setup({ failMutation: true }))

    it('displays a toast notification on error', async () => {
      const { result } = renderHook(() => useRepoActivation(), { wrapper })

      await act(async () => {
        result.current.toggleRepoState(false)
      })

      await waitFor(() =>
        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'We were not able to activate this repo',
        })
      )
    })
  })
})
