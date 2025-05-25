import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useYamlConfig } from './useYamlConfig'

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

beforeAll(() => {
  server.listen()
})

beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})

afterAll(() => {
  server.close()
})

describe('useYamlConfig', () => {
  function setup(dataReturned = {}) {
    server.use(
      http.post('/graphql/gh', () => {
        return HttpResponse.json({ data: dataReturned })
      })
    )
  }

  describe('when called and user is unauthenticated', () => {
    beforeEach(() => {
      setup({ owner: { yaml: null } })
    })

    describe('when data is loaded', () => {
      it('returns null', async () => {
        const { result } = renderHook(
          () => useYamlConfig({ variables: { username: 'doggo' } }),
          {
            wrapper,
          }
        )

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() => expect(result.current.data).toEqual(null))
      })
    })
  })

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup({ owner: { yaml: 'hello' } })
    })

    it('returns the owners yaml file', async () => {
      const { result } = renderHook(
        () => useYamlConfig({ variables: { username: 'doggo' } }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(result.current.data).toEqual('hello'))
    })
  })
})
