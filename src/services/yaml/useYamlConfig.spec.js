import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateYaml } from './index'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useUpdateYaml', () => {
  function setup(dataReturned = {}) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(dataReturned))
      })
    )
    renderHook(() => useUpdateYaml({ username: 'doggo' }), {
      wrapper,
    })
  }

  describe('when mutate is called', () => {
    describe('and is authenticated', () => {
      beforeEach(() => {
        jest.resetAllMocks()
        setup({
          data: {
            setYamlOnOwner: {
              owner: { yaml: 'hello: there', username: 'doggo' },
            },
          },
        })
      })

      it('to return the new yaml', async () => {
        const { result, waitFor } = renderHook(
          () => useUpdateYaml({ username: 'doggo' }),
          {
            wrapper,
          }
        )

        result.current.mutate({
          yaml: 'hello:there',
        })

        await waitFor(() => result.current.isSuccess)

        expect(result.current.data).toStrictEqual({
          data: {
            setYamlOnOwner: {
              owner: { yaml: 'hello: there', username: 'doggo' },
            },
          },
        })
      })
    })
  })
})
