import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useServiceProviders } from './useServiceProviders'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

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

describe('useServiceProviders', () => {
  function setup(data) {
    server.use(
      graphql.query('GetServiceProviders', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
    )
  }

  describe('third party services are configured providers', () => {
    beforeEach(() => {
      setup({
        config: {
          loginProviders: ['GITHUB', 'GITLAB', 'BITBUCKET'],
        },
      })
    })
    it('returns data', async () => {
      const { result } = renderHook(() => useServiceProviders(), { wrapper })
      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          providerList: ['GITHUB', 'GITLAB', 'BITBUCKET'],
          github: true,
          gitlab: true,
          bitbucket: true,
        })
      )
    })
  })

  describe('self hosted services are configured providers', () => {
    beforeEach(() => {
      setup({
        config: {
          loginProviders: [
            'GITHUB_ENTERPRISE',
            'GITLAB_ENTERPRISE',
            'BITBUCKET_SERVER',
          ],
        },
      })
    })
    it('returns data', async () => {
      const { result } = renderHook(() => useServiceProviders(), { wrapper })

      await waitFor(() => result.current.isSuccess)

      await waitFor(() =>
        expect(result.current.data).toStrictEqual({
          providerList: [
            'GITHUB_ENTERPRISE',
            'GITLAB_ENTERPRISE',
            'BITBUCKET_SERVER',
          ],
          github: true,
          gitlab: true,
          bitbucket: true,
        })
      )
    })
  })
})
