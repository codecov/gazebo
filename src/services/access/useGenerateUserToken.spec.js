import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useGenerateUserToken } from './index'

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

const provider = 'gh'
const server = setupServer()

beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useGenerateUserToken', () => {
  function setup(dataReturned) {
    server.use(
      graphql.mutation(`CreateUserToken`, (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ data: dataReturned }))
      })
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({
        me: null,
      })
    })

    it('is not loading yet', () => {
      const { result } = renderHook(() => useGenerateUserToken({ provider }), {
        wrapper,
      })
      expect(result.current.isLoading).toBeFalsy()
    })

    describe('when calling the mutation', () => {
      const data = {
        sessionid: 1,
      }

      it('returns success', async () => {
        const { result, waitFor } = renderHook(
          () => useGenerateUserToken({ provider }),
          {
            wrapper,
          }
        )
        result.current.mutate(data)
        await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
      })
    })
  })
})
