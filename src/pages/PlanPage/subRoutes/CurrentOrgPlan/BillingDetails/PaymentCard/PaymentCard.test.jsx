import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeContextProvider } from 'shared/ThemeContext'
import { Plans } from 'shared/utils/billing'

import PaymentCard from './PaymentCard'

const queryClient = new QueryClient()

const mocks = vi.hoisted(() => ({
  useUpdatePaymentMethod: vi.fn(),
  useCreateStripeSetupIntent: vi.fn(),
}))

vi.mock('services/account/useUpdatePaymentMethod', async () => {
  const actual = await vi.importActual(
    'services/account/useUpdatePaymentMethod'
  )
  return {
    ...actual,
    useUpdatePaymentMethod: mocks.useUpdatePaymentMethod,
  }
})

vi.mock('services/account/useCreateStripeSetupIntent', async () => {
  const actual = await vi.importActual(
    'services/account/useCreateStripeSetupIntent'
  )
  return {
    ...actual,
    useCreateStripeSetupIntent: mocks.useCreateStripeSetupIntent,
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

const subscriptionDetail = {
  defaultPaymentMethod: {
    card: {
      brand: 'visa',
      expMonth: 12,
      expYear: 2021,
      last4: '1234',
    },
  },
  plan: {
    value: Plans.USERS_PR_INAPPY,
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
}

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <ThemeContextProvider>{children}</ThemeContextProvider>
  </QueryClientProvider>
)

// mocking all the stripe components; and trusting the library :)
vi.mock('@stripe/react-stripe-js', () => {
  function makeFakeComponent(name) {
    return function Component() {
      return name
    }
  }
  return {
    useElements: () => ({
      getElement: vi.fn(),
      submit: vi.fn(),
    }),
    useStripe: () => ({}),
    PaymentElement: makeFakeComponent('PaymentElement'),
    Elements: makeFakeComponent('Elements'),
  }
})

describe('PaymentCard', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe(`when the user doesn't have any subscriptionDetail`, () => {
    // NOTE: This test is misleading because we hide this component from a higher level in
    // BillingDetails.tsx if there is no subscriptionDetail
    it('renders the set payment method message', () => {
      render(
        <PaymentCard subscriptionDetail={null} provider="gh" owner="codecov" />
      )

      expect(
        screen.getByText(
          /No payment method set. Please contact support if you think it's an error or set it yourself./
        )
      ).toBeInTheDocument()
    })
  })

  describe(`when the user doesn't have any payment method`, () => {
    it('renders an error message', () => {
      render(
        <PaymentCard
          subscriptionDetail={{
            ...subscriptionDetail,
            defaultPaymentMethod: null,
          }}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(
        screen.getByText(
          /No payment method set. Please contact support if you think it's an error or set it yourself./
        )
      ).toBeInTheDocument()
    })

    describe('when the user clicks on Set card', () => {
      it(`doesn't render the card anymore`, async () => {
        const { user } = setup()
        render(
          <PaymentCard
            subscriptionDetail={{
              ...subscriptionDetail,
              defaultPaymentMethod: null,
            }}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-modal'))

        expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
      })

      it('renders the form', async () => {
        const { user } = setup()
        render(
          <PaymentCard
            subscriptionDetail={{
              ...subscriptionDetail,
              defaultPaymentMethod: null,
            }}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-modal'))

        expect(screen.getByTestId('save-payment-method')).toBeInTheDocument()
      })
    })
  })

  describe('when the user have a card', () => {
    it('renders the card', () => {
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText(/•••• 1234/)).toBeInTheDocument()
      expect(screen.getByText(/Expires 12\/21/)).toBeInTheDocument()
    })

    it('renders the next billing', () => {
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.getByText(/December 1, 2020/)).toBeInTheDocument()
    })
  })

  describe('when the subscription is set to expire', () => {
    it(`doesn't render the next billing`, () => {
      render(
        <PaymentCard
          subscriptionDetail={{
            ...subscriptionDetail,
            cancelAtPeriodEnd: true,
          }}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      expect(screen.queryByText(/1st December, 2020/)).not.toBeInTheDocument()
    })
  })

  describe('when the user clicks on Edit card', () => {
    it(`doesn't render the card anymore`, async () => {
      const { user } = setup()
      const updatePaymentMethod = vi.fn()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: updatePaymentMethod,
        isLoading: false,
      })

      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-payment-method'))

      expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
    })

    it('renders the form', async () => {
      const { user } = setup()
      const updatePaymentMethod = vi.fn()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: updatePaymentMethod,
        isLoading: false,
      })
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-payment-method'))

      expect(screen.getByTestId('save-payment-method')).toBeInTheDocument()
    })

    describe('when submitting', () => {
      it('calls the service to update the card', async () => {
        const { user } = setup()
        const updatePaymentMethod = vi.fn()
        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: updatePaymentMethod,
          isLoading: false,
        })
        mocks.useCreateStripeSetupIntent.mockReturnValue({
          data: { clientSecret: 'test-secret' },
        })

        render(
          <PaymentCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )
        await user.click(screen.getByTestId('edit-payment-method'))
        await user.click(screen.getByTestId('save-payment-method'))

        expect(updatePaymentMethod).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      it(`doesn't render the form anymore`, async () => {
        const { user } = setup()
        mocks.useUpdatePaymentMethod.mockReturnValue({
          mutate: vi.fn(),
          isLoading: false,
        })
        render(
          <PaymentCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />,
          { wrapper }
        )

        await user.click(screen.getByTestId('edit-payment-method'))
        await user.click(screen.getByTestId('cancel-payment'))

        expect(
          screen.queryByTestId('update-payment-method')
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when there is an error in the form', () => {
    it('renders the error', async () => {
      const { user } = setup()
      const randomError = 'not rich enough'
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: vi.fn(),
        error: { message: randomError },
      })
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )

      await user.click(screen.getByTestId('edit-payment-method'))

      expect(screen.getByText(randomError)).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    it('has the error and save button disabled', async () => {
      const { user } = setup()
      mocks.useUpdatePaymentMethod.mockReturnValue({
        mutate: vi.fn(),
        isLoading: true,
      })
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />,
        { wrapper }
      )
      await user.click(screen.getByTestId('edit-payment-method'))

      expect(screen.getByTestId('save-payment-method')).toBeDisabled()
      expect(screen.getByTestId('cancel-payment')).toBeDisabled()
    })
  })
})
