import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useGenerateUserToken } from './index'

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

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useGenerateUserToken', () => {
  let hookData

  function setup(dataReturned) {
    server.use(
      graphql.mutation(`createUserToken`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ data: dataReturned }))
      })
    )
    hookData = renderHook(() => useGenerateUserToken({ provider }), {
      wrapper,
    })
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        me: null,
      })
    })

    it('is not loading yet', () => {
      expect(hookData.result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      const data = {
        sessionid: 1,
      }
      beforeEach(async () => {
        hookData.result.current.mutate(data)
        await hookData.waitFor(() => hookData.result.current.isLoading)
        await hookData.waitFor(() => !hookData.result.current.isLoading)
      })

      it('returns success', () => {
        expect(hookData.result.current.isSuccess).toBeTruthy()
      })
    })
  })
})
