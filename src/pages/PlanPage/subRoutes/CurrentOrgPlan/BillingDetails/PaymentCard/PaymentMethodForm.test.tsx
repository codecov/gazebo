import { Elements } from '@stripe/react-stripe-js'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { z } from 'zod'

import { SubscriptionDetailSchema } from 'services/account/useAccountDetails'

import PaymentMethodForm from './PaymentMethodForm'

const queryClient = new QueryClient()

const mockElements = {
  submit: vi.fn(),
  getElement: vi.fn(),
}

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => children,
  useElements: () => mockElements,
  PaymentElement: 'div',
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

const subscriptionDetail: z.infer<typeof SubscriptionDetailSchema> = {
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

const mocks = {
  useUpdatePaymentMethod: vi.fn(),
}

vi.mock('services/account/useUpdatePaymentMethod', () => ({
  useUpdatePaymentMethod: () => mocks.useUpdatePaymentMethod(),
}))

afterEach(() => {
  vi.clearAllMocks()
})

describe('PaymentMethodForm', () => {
  describe('when the user opens the Payment Method Form', () => {
    it(`doesn't render the View payment method anymore`, async () => {
      const user = userEvent.setup()
      const updatePaymentMethod = vi.fn()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: updatePaymentMethod,
        isLoading: false,
      })

      render(
        <PaymentMethodForm
          accountDetails={subscriptionDetail}
          provider="gh"
          owner="codecov"
          closeForm={() => {}}
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('save-payment-method'))

      expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
    })

    it('renders the form', async () => {
      const user = userEvent.setup()
      const updatePaymentMethod = vi.fn()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: updatePaymentMethod,
        isLoading: false,
      })
      render(
        <PaymentMethodForm
          accountDetails={subscriptionDetail}
          provider="gh"
          owner="codecov"
          closeForm={() => {}}
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('save-payment-method'))

      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument()
    })

    describe('when submitting', () => {
      it('calls the service to update the payment method', async () => {
        const user = userEvent.setup()
        const updatePaymentMethod = vi.fn()
        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: updatePaymentMethod,
          isLoading: false,
        })
        render(
          <PaymentMethodForm
            accountDetails={subscriptionDetail}
            provider="gh"
            owner="codecov"
            closeForm={() => {}}
          />,
          { wrapper }
        )
        await user.click(screen.getByTestId('save-payment-method'))
        expect(updatePaymentMethod).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      it(`doesn't render the form anymore`, async () => {
        const user = userEvent.setup()
        const closeForm = vi.fn()
        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: vi.fn(),
          isLoading: false,
        })
        render(
          <PaymentMethodForm
            accountDetails={subscriptionDetail}
            provider="gh"
            owner="codecov"
            closeForm={closeForm}
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('save-payment-method'))
        await user.click(screen.getByRole('button', { name: /Cancel/ }))

        expect(closeForm).toHaveBeenCalled()
      })
    })
  })

  describe('when there is an error in the form', () => {
    it('renders the error', async () => {
      const user = userEvent.setup()
      const randomError = 'not rich enough'
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: vi.fn(),
        error: { message: randomError },
      })
      render(
        <PaymentMethodForm
          accountDetails={subscriptionDetail}
          provider="gh"
          owner="codecov"
          closeForm={() => {}}
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('save-payment-method'))

      expect(screen.getByText(randomError)).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    it('has the error and save button disabled', async () => {
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: vi.fn(),
        isLoading: true,
      })
      render(
        <PaymentMethodForm
          accountDetails={subscriptionDetail}
          provider="gh"
          owner="codecov"
          closeForm={() => {}}
        />,
        { wrapper }
      )

      expect(screen.queryByRole('button', { name: /Save/i })).toBeDisabled()
      expect(screen.queryByRole('button', { name: /Cancel/i })).toBeDisabled()
    })
  })
})
