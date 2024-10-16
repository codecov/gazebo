import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateYaml } from './useUpdateYaml'

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

describe('useUpdateYaml', () => {
  function setup(dataReturned = {}) {
    server.use(
      http.post('/graphql/gh', () => {
        return HttpResponse.json(dataReturned)
      })
    )
  }

  describe('when mutate is called', () => {
    describe('and is authenticated', () => {
      beforeEach(() => {
        setup({
          data: {
            setYamlOnOwner: {
              owner: { yaml: 'hello: there', username: 'doggo' },
            },
          },
        })
      })

      it('to return the new yaml', async () => {
        const { result } = renderHook(
          () => useUpdateYaml({ username: 'doggo' }),
          {
            wrapper,
          }
        )

        result.current.mutate({
          yaml: 'hello:there',
        })

        await waitFor(() => result.current.isLoading)
        await waitFor(() => !result.current.isLoading)

        await waitFor(() =>
          expect(result.current.data).toStrictEqual({
            data: {
              setYamlOnOwner: {
                owner: { yaml: 'hello: there', username: 'doggo' },
              },
            },
          })
        )
      })
    })
  })
})
