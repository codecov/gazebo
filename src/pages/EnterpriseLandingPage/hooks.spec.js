import { renderHook } from '@testing-library/react-hooks'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from 'react-query'

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

const mockData = {
  loginProviders: [
    'GITHUB',
    'GITHUB_ENTERPRISE',
    'GITLAB',
    'GITLAB_ENTERPRISE',
    'BITBUCKET',
    'BITBUCKET_SERVER',
  ],
}

describe('useServiceProviders', () => {
  let hookData
  function setup() {
    server.use(
      graphql.query('GetServiceProviders', (req, res, ctx) =>
        res(ctx.status(200), ctx.data(mockData))
      )
    )

    hookData = renderHook(() => useServiceProviders(), { wrapper })
  }

  beforeEach(() => {
    setup()
  })

  it('returns data', async () => {
    await hookData.waitFor(() => hookData.result.current.isSuccess)

    expect(hookData.result.current.data).toStrictEqual(mockData.loginProviders)
  })
})
