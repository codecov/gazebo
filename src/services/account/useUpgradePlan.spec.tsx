import { useStripe } from '@stripe/react-stripe-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpgradePlan } from './useUpgradePlan'

jest.mock('@stripe/react-stripe-js')

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
  let redirectToCheckout: any

  function setupStripe() {
    redirectToCheckout = jest.fn().mockResolvedValue(undefined)
    const mockedUseStripe = useStripe as jest.Mock
    mockedUseStripe.mockReturnValue({
      redirectToCheckout,
    })
  }

  function setup() {
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
        const { result } = renderHook(
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
        const { result } = renderHook(
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
