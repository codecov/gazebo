import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

import { Plans } from 'shared/utils/billing'

import { useUpdateBillingAddress } from './useUpdateBillingAddress'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
)

const server = setupServer()
beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})

const provider = 'gh'
const owner = 'codecov'

const accountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 5,
    value: Plans.USERS_PR_INAPPM,
  },
  subscription_detail: {
    latest_invoice: {
      id: 'in_1JnNyfGlVGuVgOrkkdkCYayW',
    },
    default_payment_method: {
      card: {
        brand: 'mastercard',
        exp_month: 4,
        exp_year: 2023,
        last4: '8091',
      },
      billing_details: {
        email: null,
        name: null,
        phone: null,
      },
    },
    cancel_at_period_end: false,
    current_period_end: 1636479475,
  },
  activatedUserCount: 2,
  inactiveUserCount: 1,
}

describe('useUpdateBillingAddress', () => {
  const mockBody = vi.fn()

  function setup() {
    server.use(
      http.patch(
        `/internal/${provider}/${owner}/account-details/update_billing_address`,
        async (info) => {
          const body = await info.request.json()
          mockBody(body)

          return HttpResponse.json(accountDetails)
        }
      )
    )
  }

  describe('when called', () => {
    beforeEach(() => {})

    it('calls with the correct body', async () => {
      setup()
      const { result } = renderHook(
        () => useUpdateBillingAddress({ provider, owner }),
        { wrapper }
      )

      result.current.mutate(
        {
          name: 'Beep Boop',
          address: {
            line1: '45 Fremont St.',
            line2: '',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            postal_code: '94105',
          },
        },
        {}
      )

      await waitFor(() => result.current.isLoading)
      await waitFor(() => !result.current.isLoading)

      await waitFor(() => expect(mockBody).toHaveBeenCalled())
      await waitFor(() =>
        expect(mockBody).toHaveBeenCalledWith({
          billing_address: {
            line_1: '45 Fremont St.',
            line_2: '',
            city: 'San Francisco',
            state: 'CA',
            country: 'US',
            postal_code: '94105',
          },
          name: 'Beep Boop',
        })
      )
    })
  })
})
