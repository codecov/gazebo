import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BillingDetails from './BillingDetails'

jest.mock('./PaymentCard/PaymentCard', () => () => 'Payment Card')

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh/codecov']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())
interface SetupArgs {
  hasSubscription: boolean
}

const mockSubscription = {
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '1234',
    },
  },
  plan: {
    value: 'users-pr-inappy',
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
}

describe('BillingDetails', () => {
  function setup(
    { hasSubscription = true }: SetupArgs = {
      hasSubscription: true,
    }
  ) {
    server.use(
      rest.get('/internal/gh/:owner/account-details/', (req, res, ctx) => {
        if (hasSubscription) {
          return res(
            ctx.status(200),
            ctx.json({ subscriptionDetail: mockSubscription })
          )
        } else {
          return res(ctx.status(200), ctx.json({ subscriptionDetail: null }))
        }
      })
    )
  }

  describe('when there is a subscription', () => {
    beforeEach(() => {
      setup({ hasSubscription: true })
    })

    it('renders the payment card', async () => {
      render(<BillingDetails />, { wrapper })

      const paymentCard = await screen.findByText(/Payment Card/)
      expect(paymentCard).toBeInTheDocument()
    })
  })

  describe('when there is not a subscription', () => {
    beforeEach(() => {
      setup({ hasSubscription: false })
    })

    it('renders the payment card', async () => {
      render(<BillingDetails />, { wrapper })

      const paymentCard = screen.queryByText(/Payment Card/)
      expect(paymentCard).not.toBeInTheDocument()
    })
  })
})
