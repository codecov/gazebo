import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'

import { useServiceProviders } from './hooks'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({}),
}))

const queryClient = new QueryClient()
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
  let hookData
  function setup(data) {
    server.use(
      graphql.query('GetServiceProviders', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(data))
      )
    )

    hookData = renderHook(() => useServiceProviders(), { wrapper })
  }

  describe('third party services are configured providers', () => {
    beforeEach(() => {
      setup({
        loginProviders: ['GITHUB', 'GITLAB', 'BITBUCKET'],
      })
    })
    it('returns data', async () => {
      await hookData.waitFor(() => hookData.result.current.isSuccess)

      expect(hookData.result.current.data).toStrictEqual({
        providerList: ['GITHUB', 'GITLAB', 'BITBUCKET'],
        github: true,
        gitlab: true,
        bitbucket: true,
      })
    })
  })

  describe('self hosted services are configured providers', () => {
    beforeEach(() => {
      setup({
        loginProviders: [
          'GITHUB_ENTERPRISE',
          'GITLAB_ENTERPRISE',
          'BITBUCKET_SERVER',
        ],
      })
    })
    it('returns data', async () => {
      await hookData.waitFor(() => hookData.result.current.isSuccess)

      expect(hookData.result.current.data).toStrictEqual({
        providerList: [
          'GITHUB_ENTERPRISE',
          'GITLAB_ENTERPRISE',
          'BITBUCKET_SERVER',
        ],
        github: true,
        gitlab: true,
        bitbucket: true,
      })
    })
  })
})
