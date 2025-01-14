import { Elements } from '@stripe/react-stripe-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route } from 'react-router-dom'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account'

import EditPaymentMethods from './EditPaymentMethods'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

vi.mock('./PaymentMethod/PaymentMethodForm', () => ({
  default: () => 'Payment Method Form',
}))

vi.mock('./Address/AddressForm', () => ({
  default: () => 'Address Form',
}))

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <Elements stripe={null}>
      <MemoryRouter initialEntries={['/plan/gh/codecov']}>
        <Route path="/plan/:provider/:owner">{children}</Route>
      </MemoryRouter>
    </Elements>
  </QueryClientProvider>
)

const mockSubscriptionDetail: z.infer<typeof SubscriptionDetailSchema> = {
  defaultPaymentMethod: {
    billingDetails: {
      address: {
        line1: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'US',
        line2: null,
      },
      phone: '1234567890',
      name: 'John Doe',
      email: 'test@example.com',
    },
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2025,
      last4: '4242',
    },
  },
  currentPeriodEnd: 1706851492,
  cancelAtPeriodEnd: false,
  customer: {
    id: 'cust_123',
    email: 'test@example.com',
  },
  latestInvoice: null,
  taxIds: [],
  trialEnd: null,
}

describe('EditPaymentMethod', () => {
  it('renders the expected forms', () => {
    render(
      <EditPaymentMethods
        setEditMode={() => {}}
        provider="gh"
        owner="codecov"
        subscriptionDetail={mockSubscriptionDetail}
      />,
      { wrapper }
    )

    expect(screen.getByText(/Payment Method Form/)).toBeInTheDocument()
    expect(screen.getByText(/Address Form/)).toBeInTheDocument()
  })
})
