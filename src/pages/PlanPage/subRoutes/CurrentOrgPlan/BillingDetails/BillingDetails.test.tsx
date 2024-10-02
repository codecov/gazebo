import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { MemoryRouter, Route } from 'react-router-dom'

import BillingDetails from './BillingDetails'

vi.mock('./PaymentCard/PaymentCard', () => ({ default: () => 'Payment Card' }))
vi.mock('./EmailAddress/EmailAddress', () => ({
  default: () => 'Email Address',
}))
vi.mock('./Address/AddressCard', () => ({ default: () => 'Address Card' }))

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
  hasSubscription?: boolean
  hasTax?: boolean
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
  taxIds: [],
}

describe('BillingDetails', () => {
  function setup(
    { hasSubscription = true, hasTax = false }: SetupArgs = {
      hasSubscription: true,
    }
  ) {
    server.use(
      http.get('/internal/gh/:owner/account-details/', (info) => {
        if (hasSubscription) {
          return HttpResponse.json({
            subscriptionDetail: hasTax
              ? {
                  ...mockSubscription,
                  taxIds: [
                    { type: 'k', value: 'lol' },
                    { type: 'nah', value: 'nice' },
                  ],
                }
              : mockSubscription,
          })
        }
        return HttpResponse.json({
          subscriptionDetail: null,
        })
      })
    )
  }

  describe('when there is a subscription', () => {
    it('renders the payment card', async () => {
      setup({ hasSubscription: true })
      render(<BillingDetails />, { wrapper })

      const paymentCard = await screen.findByText(/Payment Card/)
      expect(paymentCard).toBeInTheDocument()
    })

    it('renders the email address component', async () => {
      setup({ hasSubscription: true })
      render(<BillingDetails />, { wrapper })

      const emailCard = await screen.findByText(/Email Address/)
      expect(emailCard).toBeInTheDocument()
    })

    it('renders the address card', async () => {
      setup({ hasSubscription: true })
      render(<BillingDetails />, { wrapper })

      const addressCard = await screen.findByText(/Address Card/)
      expect(addressCard).toBeInTheDocument()
    })

    it('renders the tax information if exists', async () => {
      setup({ hasSubscription: true, hasTax: true })
      render(<BillingDetails />, { wrapper })

      const taxSection = await screen.findByText(/Tax ID/)
      expect(taxSection).toBeInTheDocument()
    })

    it('does not render tax info if does not exist', () => {
      setup({ hasSubscription: true, hasTax: false })
      render(<BillingDetails />, { wrapper })

      expect(screen.queryByText(/Tax ID/)).not.toBeInTheDocument()
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
