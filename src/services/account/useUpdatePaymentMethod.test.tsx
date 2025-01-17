import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import { Plans } from 'shared/utils/billing'

import { useUpdatePaymentMethod } from './useUpdatePaymentMethod'

const mocks = vi.hoisted(() => ({
  useStripe: vi.fn(),
  useCreateStripeSetupIntent: vi.fn(),
}))

vi.mock('@stripe/react-stripe-js', async () => {
  const original = await vi.importActual('@stripe/react-stripe-js')
  return {
    ...original,
    useStripe: mocks.useStripe,
  }
})

vi.mock('./useCreateStripeSetupIntent', () => ({
  useCreateStripeSetupIntent: mocks.useCreateStripeSetupIntent,
}))

const stripePromise = loadStripe('fake-publishable-key')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const wrapper =
  (initialEntries = '/gh'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider">
          <Elements stripe={stripePromise}>{children}</Elements>
        </Route>
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

describe('useUpdatePaymentMethod', () => {
  const card = {
    last4: '1234',
  }

  function setupStripe({ confirmSetup }: { confirmSetup: Mock }) {
    mocks.useStripe.mockReturnValue({
      confirmSetup,
    })
    mocks.useCreateStripeSetupIntent.mockReturnValue({
      data: { clientSecret: 'test_secret' },
    })
  }

  describe('when called', () => {
    describe('when the mutation is successful', () => {
      beforeEach(() => {
        setupStripe({
          confirmSetup: vi.fn(
            () =>
              new Promise((resolve) => {
                resolve({
                  setupIntent: { payment_method: 'test_payment_method' },
                })
              })
          ),
        })

        server.use(
          http.patch(
            `/internal/${provider}/${owner}/account-details/update_payment`,
            () => {
              return HttpResponse.json(accountDetails)
            }
          )
        )
      })

      it('returns the data from the server', async () => {
        const { result } = renderHook(
          () =>
            useUpdatePaymentMethod({ provider, owner, email: 'test@test.com' }),
          { wrapper: wrapper() }
        )

        // @ts-expect-error mutation mock
        result.current.mutate(card)

        await waitFor(() => expect(result.current.data).toEqual(accountDetails))
      })
    })

    describe('when the mutation is not successful', () => {
      beforeEach(() => {
        vi.spyOn(console, 'error').mockImplementation(() => {})

        setupStripe({
          confirmSetup: vi.fn(
            () =>
              new Promise((resolve) => {
                resolve({ error: { message: 'not good' } })
              })
          ),
        })

        server.use(
          http.patch(
            `/internal/${provider}/${owner}/account-details/update_payment`,
            () => {
              return HttpResponse.json(accountDetails)
            }
          )
        )
      })

      afterAll(() => {
        vi.restoreAllMocks()
      })

      it('does something', async () => {
        const { result } = renderHook(
          () =>
            useUpdatePaymentMethod({ provider, owner, email: 'test@test.com' }),
          { wrapper: wrapper() }
        )

        // @ts-expect-error mutation mock
        result.current.mutate(card)

        await waitFor(() => result.current.error)
        await waitFor(() =>
          expect(result.current.error).toEqual({ message: 'not good' })
        )
      })
    })
  })
})
