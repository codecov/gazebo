import { useStripe } from '@stripe/react-stripe-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook } from '@testing-library/react-hooks'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpgradePlan } from './useUpgradePlan'

jest.mock('@stripe/react-stripe-js')

const queryClient = new QueryClient()
const wrapper =
  (initialEntries = '/gh') =>
  ({ children }) =>
    (
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
    value: 'users-inappm',
  },
  activatedUserCount: 2,
  inactiveUserCount: 1,
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('useUpgradePlan', () => {
  let redirectToCheckout

  function setupStripe() {
    redirectToCheckout = jest.fn().mockResolvedValue()
    useStripe.mockReturnValue({
      redirectToCheckout,
    })
  }

  function setup(currentUrl) {
    setupStripe()
  }

  describe('when called', () => {
    beforeEach(() => {
      setup()
    })

    describe('when calling the mutation, which return a checkoutSessionId', () => {
      beforeEach(() => {
        server.use(
          rest.patch(
            `/internal/${provider}/${owner}/account-details/`,
            (req, res, ctx) => {
              return res(
                ctx.status(200),
                ctx.json({
                  ...accountDetails,
                  checkoutSessionId: '1234',
                })
              )
            }
          )
        )
      })

      it('calls redirectToCheckout on the Stripe client', async () => {
        const { result, waitFor } = renderHook(
          () => useUpgradePlan({ provider, owner }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate({
          seats: 12,
          newPlan: 'users-pr-inappy',
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
          rest.patch(
            `/internal/${provider}/${owner}/account-details/`,
            (req, res, ctx) => {
              return res(
                ctx.status(200),
                ctx.json({
                  ...accountDetails,
                  checkoutSessionId: null,
                })
              )
            }
          )
        )
      })

      it('does not call redirectToCheckout on the Stripe client', async () => {
        const { result, waitFor } = renderHook(
          () => useUpgradePlan({ provider, owner }),
          {
            wrapper: wrapper(),
          }
        )

        result.current.mutate({
          seats: 12,
          newPlan: 'users-pr-inappy',
        })

        await waitFor(() => result.current.isSuccess)

        await waitFor(() => expect(redirectToCheckout).not.toHaveBeenCalled())
      })
    })
  })
})
