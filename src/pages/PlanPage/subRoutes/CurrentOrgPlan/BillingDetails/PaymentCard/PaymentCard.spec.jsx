import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUpdateCard } from 'services/account'

import PaymentCard from './PaymentCard'

jest.mock('services/account')

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

// mocking all the stripe components; and trusting the library :)
jest.mock('@stripe/react-stripe-js', () => {
  function makeFakeComponent(name) {
    // mocking onReady to be called after a bit of time
    return function Component({ onReady }) {
      return name
    }
  }
  return {
    useElements: () => ({
      getElement: jest.fn(),
    }),
    useStripe: () => ({}),
    CardElement: makeFakeComponent('CardElement'),
  }
})

describe('PaymentCard', () => {
  function setup() {
    const user = userEvent.setup()

    return { user }
  }

  describe(`when the user doesn't have any subscriptionDetail`, () => {
    it('renders nothing', () => {
      const { container } = render(
        <PaymentCard subscriptionDetail={null} provider="gh" owner="codecov" />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe(`when the user doesn't have a card but is on a free plan`, () => {
    it('renders nothing', () => {
      const { container } = render(
        <PaymentCard
          subscriptionDetail={{
            ...subscriptionDetail,
            defaultPaymentMethod: null,
            plan: {
              value: 'users-free',
            },
          }}
          provider="gh"
          owner="codecov"
        />
      )

      expect(container).toBeEmptyDOMElement()
    })
  })

  describe(`when the user doesn't have any cards but has a paid plan`, () => {
    it('renders an error message', () => {
      render(
        <PaymentCard
          subscriptionDetail={{
            ...subscriptionDetail,
            defaultPaymentMethod: null,
          }}
          provider="gh"
          owner="codecov"
        />
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
          />
        )

        useUpdateCard.mockReturnValue({
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
          />
        )

        useUpdateCard.mockReturnValue({
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
        />
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
        />
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
        />
      )

      expect(screen.queryByText(/1st December, 2020/)).not.toBeInTheDocument()
    })
  })

  describe('when the user clicks on Edit card', () => {
    it(`doesn't render the card anymore`, async () => {
      const { user } = setup()
      const updateCard = jest.fn()
      useUpdateCard.mockReturnValue({
        mutate: updateCard,
        isLoading: false,
      })

      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )
      await user.click(screen.getByTestId('edit-card'))

      expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
    })

    it('renders the form', async () => {
      const { user } = setup()
      const updateCard = jest.fn()
      useUpdateCard.mockReturnValue({
        mutate: updateCard,
        isLoading: false,
      })
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )
      await user.click(screen.getByTestId('edit-card'))

      expect(
        screen.getByRole('button', { name: /update/i })
      ).toBeInTheDocument()
    })

    describe('when submitting', () => {
      it('calls the service to update the card', async () => {
        const { user } = setup()
        const updateCard = jest.fn()
        useUpdateCard.mockReturnValue({
          mutate: updateCard,
          isLoading: false,
        })
        render(
          <PaymentCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />
        )
        await user.click(screen.getByTestId('edit-card'))
        await user.click(screen.queryByRole('button', { name: /update/i }))

        expect(updateCard).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      it(`doesn't render the form anymore`, async () => {
        const { user } = setup()
        useUpdateCard.mockReturnValue({
          mutate: jest.fn(),
          isLoading: false,
        })
        render(
          <PaymentCard
            subscriptionDetail={subscriptionDetail}
            provider="gh"
            owner="codecov"
          />
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
      useUpdateCard.mockReturnValue({
        mutate: jest.fn(),
        error: { message: randomError },
      })
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )

      await user.click(screen.getByTestId('edit-card'))

      expect(screen.getByText(randomError)).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    it('has the error and save button disabled', async () => {
      const { user } = setup()
      useUpdateCard.mockReturnValue({ mutate: jest.fn(), isLoading: true })
      render(
        <PaymentCard
          subscriptionDetail={subscriptionDetail}
          provider="gh"
          owner="codecov"
        />
      )
      await user.click(screen.getByTestId('edit-card'))

      expect(screen.queryByRole('button', { name: /update/i })).toBeDisabled()
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
