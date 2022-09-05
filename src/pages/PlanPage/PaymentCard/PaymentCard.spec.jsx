import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useUpdateCard } from 'services/account'

import PaymentCard from './PaymentCard'

jest.mock('services/account/hooks')

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
    CardExpiryElement: makeFakeComponent('CardExpiryElement'),
    CardNumberElement: makeFakeComponent('CardNumberElement'),
    CardCvcElement: makeFakeComponent('CardCvcElement'),
  }
})

describe('PaymentCard', () => {
  let wrapper
  function setup(subscriptionDetail) {
    wrapper = render(
      <PaymentCard
        subscriptionDetail={subscriptionDetail}
        provider="gh"
        owner="codecov"
      />
    )
  }

  describe('when the user doesnt have any subscriptionDetail', () => {
    beforeEach(() => {
      setup(null)
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the user doesnt have a card but is on a free plan', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        defaultPaymentMethod: null,
        plan: {
          value: 'users-free',
        },
      })
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
    })
  })

  describe('when the user doesnt have any cards but has a paid plan', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        defaultPaymentMethod: null,
      })
    })

    it('renders an error message', () => {
      expect(
        screen.getByText(
          /No credit card set. Please contact support if you think it’s an error or set it yourself./
        )
      ).toBeInTheDocument()
    })

    describe('when the user clicks on Set card', () => {
      beforeEach(() => {
        useUpdateCard.mockReturnValue({
          mutate: () => null,
          isLoading: false,
        })
        userEvent.click(screen.getByTestId('open-modal'))
      })

      it('doesnt render the card anymore', () => {
        expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
      })

      it('renders the form', () => {
        expect(
          screen.getByRole('button', { name: /update/i })
        ).toBeInTheDocument()
      })
    })
  })

  describe('when the user have a card', () => {
    beforeEach(() => {
      setup(subscriptionDetail)
    })

    it('renders the card', () => {
      expect(screen.getByText(/Visa/)).toBeInTheDocument()
      expect(
        screen.getByText(/\*\*\*\* \*\*\*\* \*\*\*\* 1234/)
      ).toBeInTheDocument()
      expect(screen.getByText(/Expires 12\/2021/)).toBeInTheDocument()
    })

    it('renders the next billing', () => {
      expect(screen.getByText(/1st December, 2020/)).toBeInTheDocument()
    })
  })

  describe('when the subscription is set to expire', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        cancelAtPeriodEnd: true,
      })
    })

    it('doesnt render the next billing', () => {
      expect(screen.queryByText(/1st December, 2020/)).not.toBeInTheDocument()
    })
  })

  describe('when the user clicks on Edit card', () => {
    const updateCard = jest.fn()

    beforeEach(() => {
      useUpdateCard.mockReturnValue({
        mutate: updateCard,
        isLoading: false,
      })
      setup(subscriptionDetail)
      userEvent.click(screen.getByTestId('edit-card'))
    })

    it('doesnt render the card anymore', () => {
      expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
    })

    it('renders the form', () => {
      expect(
        screen.getByRole('button', { name: /update/i })
      ).toBeInTheDocument()
    })

    describe('when submitting', () => {
      beforeEach(() => {
        userEvent.click(screen.queryByRole('button', { name: /update/i }))
      })

      it('calls the service to update the card', () => {
        expect(updateCard).toHaveBeenCalled()
      })
    })

    describe('when the user clicks on cancel', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
      })

      it('doesnt render the form anymore', () => {
        expect(
          screen.queryByRole('button', { name: /save/i })
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when there is an error in the form', () => {
    const randomError = 'not rich enough'

    beforeEach(() => {
      useUpdateCard.mockReturnValue({
        mutate: jest.fn(),
        error: { data: { detail: randomError } },
      })
      setup(subscriptionDetail)
      userEvent.click(screen.getByTestId('edit-card'))
    })

    it('renders the error', () => {
      expect(screen.getByText(randomError)).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    beforeEach(() => {
      useUpdateCard.mockReturnValue({ mutate: jest.fn(), isLoading: true })
      setup(subscriptionDetail)
      userEvent.click(screen.getByTestId('edit-card'))
    })

    it('has the error and save button disabled', () => {
      expect(screen.queryByRole('button', { name: /update/i })).toBeDisabled()
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
