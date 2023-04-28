import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useYamlConfig } from './index'

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

describe('useYamlConfig', () => {
  function setup(dataReturned = {}) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: dataReturned }))
      })
    )
  }

  describe('when called and user is unauthenticated', () => {
    it('renders isLoading true', () => {
      setup({ owner: { yaml: null } })
      const { result } = renderHook(
        () => useYamlConfig({ variables: { username: 'doggo' } }),
        {
          wrapper,
        }
      )
      expect(result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      it('returns null', async () => {
        setup({ owner: { yaml: null } })

        const { result, waitFor } = renderHook(
          () => useYamlConfig({ variables: { username: 'doggo' } }),
          {
            wrapper,
          }
        )
        await waitFor(() => result.current.isSuccess)
        expect(result.current.data).toEqual(null)
      })
    })
  })

  describe('when called and user is authenticated', () => {
    it('returns the owners yaml file', async () => {
      setup({ owner: { yaml: 'hello' } })
      const { result, waitFor } = renderHook(
        () => useYamlConfig({ variables: { username: 'doggo' } }),
        {
          wrapper,
        }
      )
      await waitFor(() => result.current.isSuccess)
      expect(result.current.data).toEqual('hello')
    })
  })
})
