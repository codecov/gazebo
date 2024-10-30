import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ThemeContextProvider } from 'shared/ThemeContext'

import PaymentCard from './PaymentCard'

const mocks = vi.hoisted(() => ({
  useUpdateCard: vi.fn(),
}))

vi.mock('services/account', async () => {
  const actual = await vi.importActual('services/account')
  return {
    ...actual,
    useUpdateCard: mocks.useUpdateCard,
  }
})
window.matchMedia = vi.fn().mockResolvedValue({ matches: false })

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
    value: 'users-pr-inappy',
  },
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
}

const wrapper = ({ children }) => (
  <ThemeContextProvider>{children}</ThemeContextProvider>
)

// mocking all the stripe components; and trusting the library :)
vi.mock('@stripe/react-stripe-js', () => {
  function makeFakeComponent(name) {
    // mocking onReady to be called after a bit of time
    return function Component({ onReady }) {
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

describe('PaymentCard', () => {
  afterAll(() => {
    vi.clearAllMocks()
  })
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe(`when the user doesn't have any subscriptionDetail`, () => {
    // NOTE: This test is misleading because we hide this component from a higher level in
    // BillingDetails.tsx if there is no subscriptionDetail
    it('renders the set card message', () => {
      render(
        <PaymentCard subscriptionDetail={null} provider="gh" owner="codecov" />
      )

      expect(
        screen.getByText(
          /No credit card set. Please contact support if you think it’s an error or set it yourself./
        )
      ).toBeInTheDocument()
    })
  })

  describe(`when the user doesn't have any card`, () => {
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
          /No credit card set. Please contact support if you think it’s an error or set it yourself./
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

        mocks.useUpdateCard.mockReturnValue({
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

        mocks.useUpdateCard.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        await user.click(screen.getByTestId('open-modal'))

        expect(
          screen.getByRole('button', { name: /update/i })
        ).toBeInTheDocument()
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
      const updateCard = vi.fn()
      mocks.useUpdateCard.mockReturnValue({
        mutate: updateCard,
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
      await user.click(screen.getByTestId('edit-card'))

      expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
    })

    it('renders the form', async () => {
      const { user } = setup()
      const updateCard = vi.fn()
      mocks.useUpdateCard.mockReturnValue({
        mutate: updateCard,
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
      await user.click(screen.getByTestId('edit-card'))

      expect(
        screen.getByRole('button', { name: /update/i })
      ).toBeInTheDocument()
    })

    describe('when submitting', () => {
      it('calls the service to update the card', async () => {
        const { user } = setup()
        const updateCard = vi.fn()
        mocks.useUpdateCard.mockReturnValue({
          mutate: updateCard,
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
        await user.click(screen.getByTestId('edit-card'))
        await user.click(screen.queryByRole('button', { name: /update/i }))

        expect(updateCard).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      it(`doesn't render the form anymore`, async () => {
        const { user } = setup()
        mocks.useUpdateCard.mockReturnValue({
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

        await user.click(screen.getByTestId('edit-card'))
        await user.click(screen.getByRole('button', { name: /Cancel/ }))

        expect(
          screen.queryByRole('button', { name: /save/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when there is an error in the form', () => {
    it('renders the error', async () => {
      const { user } = setup()
      const randomError = 'not rich enough'
      mocks.useUpdateCard.mockReturnValue({
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

      await user.click(screen.getByTestId('edit-card'))

      expect(screen.getByText(randomError)).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    it('has the error and save button disabled', async () => {
      const { user } = setup()
      mocks.useUpdateCard.mockReturnValue({
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
      await user.click(screen.getByTestId('edit-card'))

      expect(screen.queryByRole('button', { name: /update/i })).toBeDisabled()
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
