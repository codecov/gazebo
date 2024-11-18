import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'
import type { MockInstance } from 'vitest'

import { Plans } from 'shared/utils/billing'

import { useUpgradePlan } from './useUpgradePlan'

const mocks = vi.hoisted(() => ({
  useStripe: vi.fn(),
}))

vi.mock('@stripe/react-stripe-js', async () => {
  const original = await vi.importActual('@stripe/react-stripe-js')
  return {
    ...original,
    useStripe: mocks.useStripe,
  }
})

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">{children}</Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

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
  activatedUserCount: 2,
  inactiveUserCount: 1,
}

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

describe('useUpgradePlan', () => {
  let redirectToCheckout: any

  function setupStripe() {
    redirectToCheckout = vi.fn().mockResolvedValue(undefined)
    mocks.useStripe.mockReturnValue({
      redirectToCheckout,
    })
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  function setup() {
    setupStripe()
  }

  describe('when called', () => {
    beforeEach(() => {
      server.use(
        http.patch(
          `/internal/${provider}/${owner}/account-details/`,
          (info) => {
            return HttpResponse.json({
              ...accountDetails,
              checkoutSessionId: '1234',
            })
          }
        )
      )
    })

    describe('when calling the mutation, which return a checkoutSessionId', () => {
      let consoleSpy: MockInstance
      beforeEach(() => {
        consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      })

      afterAll(() => {
        consoleSpy.mockRestore()
      })

      it('calls redirectToCheckout on the Stripe client', async () => {
        setup()
        const { result } = renderHook(
          () => useUpgradePlan({ provider, owner }),
          { wrapper: wrapper() }
        )

        result.current.mutate({
          seats: 12,
          newPlan: Plans.USERS_PR_INAPPY,
        })

        await waitFor(() => {
          expect(redirectToCheckout).toHaveBeenCalledWith({
            sessionId: '1234',
          })
        })
      })
    })

    describe('when calling the mutation, which does not return a checkoutSessionId', () => {
      beforeEach(() => {
        server.use(
          http.patch(
            `/internal/${provider}/${owner}/account-details/`,
            (info) => {
              return HttpResponse.json({
                ...accountDetails,
                checkoutSessionId: null,
              })
            }
          )
        )
      })

      it('does not call redirectToCheckout on the Stripe client', async () => {
        const { result } = renderHook(
          () => useUpgradePlan({ provider, owner }),
          { wrapper: wrapper() }
        )

        result.current.mutate({
          seats: 12,
          newPlan: Plans.USERS_PR_INAPPY,
        })

        await waitFor(() => expect(redirectToCheckout).not.toHaveBeenCalled())
      })
    })
  })
})
