import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useEncodeString } from './useEncodeString'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/gazebo/settings']}>
    <Route path="/:provider/:owner/:repo/settings">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)
describe('useEncodeString', () => {
  function setup() {
    server.use(
      rest.post(
        `internal/github/codecov/repos/gazebo/encode/`,
        (req, res, ctx) => {
          return res(ctx.status(200), ctx.json())
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when calling the mutation', () => {
      describe('when successful', () => {
        it('returns isSuccess true', async () => {
          const { result } = renderHook(() => useEncodeString(), {
            wrapper,
          })

          const data = { value: 'dummy' }
          result.current.mutate(data)

          await waitFor(() => result.current.isLoading)
          await waitFor(() => !result.current.isLoading)

          await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
        })
      })
    })
  })
})
