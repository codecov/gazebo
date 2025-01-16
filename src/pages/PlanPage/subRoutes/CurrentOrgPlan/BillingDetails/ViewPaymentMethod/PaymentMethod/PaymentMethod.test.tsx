import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeContextProvider } from 'shared/ThemeContext'

import PaymentMethod from './PaymentMethod'

const mocks = vi.hoisted(() => ({
  useUpdatePaymentMethod: vi.fn(),
}))

vi.mock('services/account', async () => {
  const actual = await vi.importActual('services/account')
  return {
    ...actual,
    useUpdatePaymentMethod: mocks.useUpdatePaymentMethod,
  }
})

const subscriptionDetail = {
  defaultPaymentMethod: {
    billingDetails: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      address: {
        city: 'New York',
        country: 'US',
        line1: '123 Main St',
        line2: 'Apt 4B',
        postalCode: '10001',
        state: 'NY',
      },
      phone: '1234567890',
    },
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '1234',
    },
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
  customer: {
    id: 'cust_123',
    email: 'test@test.com',
  },
  latestInvoice: null,
  taxIds: [],
  trialEnd: null,
}

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ThemeContextProvider>{children}</ThemeContextProvider>
)

// mocking all the stripe components; and trusting the library :)
vi.mock('@stripe/react-stripe-js', () => {
  function makeFakeComponent(name: string) {
    return function Component() {
      return name
    }
  }
  return {
    useElements: () => ({
      getElement: vi.fn(),
    }),
    useStripe: () => ({}),
    CardElement: makeFakeComponent('CardElement'),
  }
})

describe('PaymentMethodCard', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe(`when the user doesn't have any subscriptionDetail`, () => {
    // NOTE: This test is misleading because we hide this component from a higher level in
    // BillingDetails.tsx if there is no subscriptionDetail
    it('renders the set card message', () => {
      render(
        <PaymentMethod
          subscriptionDetail={null}
          provider="gh"
          owner="codecov"
          setEditMode={() => {}}
        />
      )

      expect(
        screen.getByText(
          /No payment method set. Please contact support if you think it’s an error or set it yourself./
        )
      ).toBeInTheDocument()
    })
  })

  describe(`when the user doesn't have any payment method`, () => {
    it('renders an error message', () => {
      const subscriptionDetailMissingPaymentMethod = {
        ...subscriptionDetail,
        defaultPaymentMethod: {
          ...subscriptionDetail.defaultPaymentMethod,
          card: null,
          usBankAccount: null,
        },
      }
      render(
        <PaymentMethod
          subscriptionDetail={subscriptionDetailMissingPaymentMethod}
          provider="gh"
          owner="codecov"
          setEditMode={() => {}}
        />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No payment method set. Please contact support if you think it’s an error or set it yourself./
        )
      ).toBeInTheDocument()
    })

    describe('when the user clicks on Set card', () => {
      it(`doesn't render the card anymore and opens the form`, async () => {
        const { user } = setup()
        const subscriptionDetailMissingPaymentMethod = {
          ...subscriptionDetail,
          defaultPaymentMethod: {
            ...subscriptionDetail.defaultPaymentMethod,
            card: null,
            usBankAccount: null,
          },
        }
        const setEditMode = vi.fn()
        render(
          <PaymentMethod
            subscriptionDetail={subscriptionDetailMissingPaymentMethod}
            provider="gh"
            owner="codecov"
            setEditMode={setEditMode}
          />,
          { wrapper }
        )

        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-edit-mode'))

        expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
        expect(setEditMode).toHaveBeenCalledWith(true)
      })
    })
  })

  describe('when the user have a card', () => {
    it('renders the card', () => {
      render(
        <PaymentMethod
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
          setEditMode={() => {}}
        />,
        { wrapper }
      )

      expect(screen.getByText(/•••• 1234/)).toBeInTheDocument()
      expect(screen.getByText(/Expires 12\/21/)).toBeInTheDocument()
    })

    it('renders the next billing', () => {
      render(
        <PaymentMethod
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
          setEditMode={() => {}}
        />,
        { wrapper }
      )

      expect(screen.getByText(/December 1, 2020/)).toBeInTheDocument()
    })
  })

  describe('when the subscription is set to expire', () => {
    it(`doesn't render the next billing`, () => {
      render(
        <PaymentMethod
          subscriptionDetail={{
            ...subscriptionDetail,
            cancelAtPeriodEnd: true,
          }}
          provider="gh"
          owner="codecov"
          setEditMode={() => {}}
        />,
        { wrapper }
      )

      expect(screen.queryByText(/1st December, 2020/)).not.toBeInTheDocument()
    })
  })
})
