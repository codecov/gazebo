import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateYaml, useYamlConfig } from './index'

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

describe('useUpdateYaml', () => {
  function setup(dataReturned = {}) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(dataReturned))
      })
    )
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
