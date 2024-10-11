import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'

import { useEnterpriseAccountDetails } from './useEnterpriseAccountDetails'

const mockEnterpriseAccountDetails = {
  owner: {
    account: {
      name: 'account-name',
      totalSeatCount: 10,
      activatedUserCount: 7,
      organizations: {
        totalCount: 3,
      },
    },
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

interface SetupArgs {
  badResponse?: boolean
}

describe('useEnterpriseAccountDetails', () => {
  function setup({ badResponse = false }: SetupArgs) {
    server.use(
      graphql.query('EnterpriseAccountDetails', (info) => {
        if (badResponse) {
          return HttpResponse.json({})
        }
        return HttpResponse.json({ data: mockEnterpriseAccountDetails })
      })
    )
  }

  it('returns 404 on bad response', async () => {
    setup({ badResponse: true })
    console.error = () => {}
    const { result } = renderHook(
      () => useEnterpriseAccountDetails({ provider: 'gh', owner: 'codecov' }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        status: 404,
        data: {},
        dev: 'useEnterpriseAccountDetails - 404 Failed to parse data',
      })
    )
  })

  it('returns data on good response', async () => {
    setup({})
    const { result } = renderHook(
      () =>
        useEnterpriseAccountDetails({
          provider: 'gh',
          owner: 'codecov',
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('success'))

    await waitFor(() =>
      expect(result.current.data).toMatchObject(mockEnterpriseAccountDetails)
    )
  })
})
