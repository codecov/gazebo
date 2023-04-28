import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useSelfHostedHasAdmins } from './useSelfHostedHasAdmins'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()
beforeAll(() => server.listen())
beforeEach(() => {
  server.resetHandlers()
  queryClient.clear()
})
afterAll(() => server.close())

describe('useSelfHostedHasAdmins', () => {
  function setup({ data }) {
    server.use(
      graphql.query('HasAdmins', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {
      setup({ data: { config: { hasAdmins: true } } })
    })

    it('returns isLoading', () => {
      const { result } = renderHook(
        () => useSelfHostedHasAdmins({ provider: 'gl' }),
        {
          wrapper,
        }
      )

      expect(result.current.isLoading).toBeTruthy()
    })
  })

  describe('when data is loaded', () => {
    beforeEach(async () => {
      setup({ data: { config: { hasAdmins: true } } })
    })

    it('returns the user info', async () => {
      const { result, waitFor } = renderHook(
        () => useSelfHostedHasAdmins({ provider: 'gl' }),
        {
          wrapper,
        }
      )

      await waitFor(() => result.current.isFetching)
      await waitFor(() => !result.current.isFetching)

      expect(result.current.data).toEqual(true)
    })
  })
})
