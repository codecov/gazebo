import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import React from 'react'
import { MemoryRouter, Route } from 'react-router-dom'
import { type Mock } from 'vitest'

import { Plans } from 'shared/utils/billing'

import { useUpdateCard } from './useUpdateCard'

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

describe('useUpdateCard', () => {
  const card = {
    last4: '1234',
  }

  function setupStripe({ createPaymentMethod }: { createPaymentMethod: Mock }) {
    mocks.useStripe.mockReturnValue({
      createPaymentMethod,
    })
  }

  describe('when called', () => {
    describe('when the mutation is successful', () => {
      beforeEach(() => {
        setupStripe({
          createPaymentMethod: vi.fn(
            () =>
              new Promise((resolve) => {
                resolve({ paymentMethod: { id: 1 } })
              })
          ),
        })

        server.use(
          http.patch(
            `/internal/${provider}/${owner}/account-details/update_payment`,
            (info) => {
              return HttpResponse.json(accountDetails)
            }
          )
        )
      })

      it('returns the data from the server', async () => {
        const { result } = renderHook(
          () => useUpdateCard({ provider, owner }),
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
          createPaymentMethod: vi.fn(
            () =>
              new Promise((resolve) => {
                resolve({ error: { message: 'not good' } })
              })
          ),
        })

        server.use(
          http.patch(
            `/internal/${provider}/${owner}/account-details/update_payment`,
            (info) => {
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
          () => useUpdateCard({ provider, owner }),
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
