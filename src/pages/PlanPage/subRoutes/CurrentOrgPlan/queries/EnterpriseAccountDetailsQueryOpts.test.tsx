import {
  QueryClientProvider as QueryClientProviderV5,
  QueryClient as QueryClientV5,
  useQuery as useQueryV5,
} from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { EnterpriseAccountDetailsQueryOpts } from './EnterpriseAccountDetailsQueryOpts'

const mockEnterpriseAccountDetails = {
  owner: {
    account: {
      name: 'account-name',
      totalSeatCount: 10,
      activatedUserCount: 7,
      organizations: { totalCount: 3 },
    },
  },
}

const queryClientV5 = new QueryClientV5({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProviderV5 client={queryClientV5}>
    {children}
  </QueryClientProviderV5>
)

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClientV5.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

interface SetupArgs {
  badResponse?: boolean
}

describe('useEnterpriseAccountDetails', () => {
  function setup({ badResponse = false }: SetupArgs) {
    server.use(
      graphql.query('EnterpriseAccountDetails', () => {
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
      () =>
        useQueryV5(
          EnterpriseAccountDetailsQueryOpts({
            provider: 'gh',
            owner: 'codecov',
          })
        ),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('error'))

    await waitFor(() =>
      expect(result.current.failureReason).toMatchObject({
        dev: 'EnterpriseAccountDetailsQueryOpts - Parsing Error',
        status: 400,
      })
    )
  })

  it('returns data on good response', async () => {
    setup({})
    const { result } = renderHook(
      () =>
        useQueryV5(
          EnterpriseAccountDetailsQueryOpts({
            provider: 'gh',
            owner: 'codecov',
          })
        ),
      { wrapper }
    )

    await waitFor(() => expect(result.current.status).toBe('success'))

    await waitFor(() =>
      expect(result.current.data).toMatchObject(mockEnterpriseAccountDetails)
    )
  })
})
