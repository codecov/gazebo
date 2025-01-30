import { QueryClient, QueryClientProvider } from '@tanstack/react-queryV5'
import { renderHook, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { Plans } from 'shared/utils/billing'

import { useCurrentOrgPlanPageData } from './useCurrentOrgPlanPageData'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('useCurrentOrgPlanPageData', () => {
  function setup(mockData = {}) {
    server.use(
      graphql.query('CurrentOrgPlanPageData', () => {
        return HttpResponse.json({ data: mockData })
      })
    )
  }

  it('returns null when no data is returned', async () => {
    setup({})

    const { result } = renderHook(
      () =>
        useCurrentOrgPlanPageData({
          provider: 'gh',
          owner: 'codecov',
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
    expect(result.current.data).toBe(null)
  })

  it('returns parsed data when valid data is returned', async () => {
    setup({
      owner: {
        plan: {
          value: Plans.USERS_PR_INAPPY,
        },
        billing: {
          unverifiedPaymentMethods: [
            {
              paymentMethodId: 'pm_123',
              hostedVerificationUrl: 'https://example.com',
            },
          ],
        },
      },
    })

    const { result } = renderHook(
      () =>
        useCurrentOrgPlanPageData({
          provider: 'gh',
          owner: 'codecov',
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isSuccess).toBeTruthy())
    expect(result.current.data).toEqual({
      plan: {
        value: Plans.USERS_PR_INAPPY,
      },
      billing: {
        unverifiedPaymentMethods: [
          {
            paymentMethodId: 'pm_123',
            hostedVerificationUrl: 'https://example.com',
          },
        ],
      },
    })
  })

  it('returns error when invalid data is returned', async () => {
    setup({
      owner: {
        plan: {
          value: 'INVALID_PLAN',
        },
      },
    })

    const { result } = renderHook(
      () =>
        useCurrentOrgPlanPageData({
          provider: 'gh',
          owner: 'codecov',
        }),
      { wrapper }
    )

    await waitFor(() => expect(result.current.isError).toBeTruthy())
    expect(result.current.error).toEqual({
      status: 404,
      data: null,
    })
  })
})
