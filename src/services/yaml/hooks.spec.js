import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { renderHook } from '@testing-library/react-hooks'
import { QueryClient, QueryClientProvider } from 'react-query'
import { useUpdateYaml, useYamlConfig } from './hooks'
import { MemoryRouter, Route } from 'react-router-dom'

const queryClient = new QueryClient()
const wrapper = ({ children }) => (
  <MemoryRouter initialEntries={['/gh']}>
    <Route path="/:provider">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Route>
  </MemoryRouter>
)

const provider = 'gh'
const server = setupServer()

describe('useYamlConfig', () => {
  let hookData
  beforeAll(() => server.listen())
  beforeEach(() => {
    server.resetHandlers()
    queryClient.clear()
  })
  afterAll(() => server.close())

  function setup(dataReturned = {}) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: { owner: dataReturned } }))
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
      setup()
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

xdescribe('useUpdateYaml', () => {
  let hookData

  function setup(dataReturned = {}) {
    server.use(
      rest.post(`/graphql/gh`, (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({ data: { setYamlOnOwner: dataReturned } })
        )
      })
    )
    hookData = renderHook(() => useUpdateYaml({ provider }), {
      wrapper,
    })
  }

  describe('when called', () => {
    describe('and is authenticated', () => {
      beforeEach(() => {
        setup({ owner: { yaml: 'hello' } })
      })

      it('is not loading yet', () => {
        expect(hookData.result.current.isLoading).toBeFalsy()
      })

      it('updates the yaml file', () => {
        expect(hookData.result.current.data).toEqual({
          setYamlOnOwner: { owner: { yaml: 'hello' } },
        })
      })
    })
    describe('and is not authenticated', () => {
      beforeEach(() => {
        setup()
      })

      it('is not loading yet', () => {
        expect(hookData.result.current.isLoading).toBeFalsy()
      })

      it('updates the yaml file', () => {
        expect(hookData.result.current.data).toEqual({
          setYamlOnOwner: { owner: { yaml: 'hello' } },
        })
      })
    })
  })
})
