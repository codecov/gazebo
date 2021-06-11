import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpdateYaml, useYamlConfig } from './hooks'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const mockGo = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    go: mockGo,
  }),
}))

const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useYamlConfig', () => {
  let hookData

  function setup(dataReturned = {}) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: dataReturned }))
      })
    )
    hookData = renderHook(
      () => useYamlConfig({ variables: { username: 'doggo' } }),
      {
        wrapper,
      }
    )
  }

  describe('when called and user is unauthenticated', () => {
    beforeEach(() => {
      setup({ owner: { yaml: null } })
    })

    it('renders isLoading true', () => {
      expect(hookData.result.current.isLoading).toBeTruthy()
    })

    describe('when data is loaded', () => {
      beforeEach(() => {
        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns null', () => {
        expect(hookData.result.current.data).toEqual(null)
      })
    })
  })

  describe('when called and user is authenticated', () => {
    beforeEach(() => {
      setup({ owner: { yaml: 'hello' } })
      return hookData.waitFor(() => hookData.result.current.isSuccess)
    })

    it('returns the owners yaml file', () => {
      expect(hookData.result.current.data).toEqual('hello')
    })
  })
})

describe('useUpdateYaml', () => {
  let hookData

  function setup(dataReturned = {}) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json(dataReturned))
      })
    )
    hookData = renderHook(() => useUpdateYaml({ username: 'doggo' }), {
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

        hookData.result.current.mutate({
          yaml: 'hello:there',
        })

        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('to not call a reload', () => {
        expect(hookData.result.current.data).toStrictEqual({
          data: {
            setYamlOnOwner: {
              owner: { yaml: 'hello: there', username: 'doggo' },
            },
          },
        })
        expect(mockGo).not.toHaveBeenCalled()
      })

      it('to return the new yaml', () => {
        expect(hookData.result.current.data).toStrictEqual({
          data: {
            setYamlOnOwner: {
              owner: { yaml: 'hello: there', username: 'doggo' },
            },
          },
        })
      })
    })
    describe('and is not authenticated', () => {
      beforeEach(async () => {
        jest.resetAllMocks()
        setup({ data: { setYamlOnOwner: { error: 'unauthenticated' } } })

        hookData.result.current.mutate({
          yaml: 'hello: there',
        })

        return hookData.waitFor(() => hookData.result.current.isSuccess)
      })

      it('returns an error', () => {
        expect(hookData.result.current.data).toStrictEqual({
          data: { setYamlOnOwner: { error: 'unauthenticated' } },
        })
      })

      it('calls a reload', () => {
        expect(mockGo).toHaveBeenCalled()
      })
    })
  })
})
