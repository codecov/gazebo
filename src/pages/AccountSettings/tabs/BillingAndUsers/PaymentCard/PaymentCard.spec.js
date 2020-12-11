import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import PaymentCard from './PaymentCard'
import { useUpdateCard } from 'services/account'

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
  currentPeriodEnd: 1606851492,
  cancelAtPeriodEnd: false,
}

// mocking all the stripe components; and trusting the library :)
jest.mock('@stripe/react-stripe-js', () => {
  const react = jest.requireActual('react')
  function makeFakeComponent(name) {
    // mocking onReady to be called after a bit of time
    return function Component({ onReady }) {
      react.useEffect(() => {
        onReady()
      }, [])
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

  describe('when the user doesnt have any cards', () => {
    beforeEach(() => {
      setup({
        ...subscriptionDetail,
        defaultPaymentMethod: null,
      })
    })

    it('renders nothing', () => {
      expect(wrapper.container).toBeEmptyDOMElement()
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
      useUpdateCard.mockReturnValue([updateCard, { isLoading: false }])
      setup(subscriptionDetail)
      userEvent.click(screen.getByRole('button', { name: /edit card/i }))
    })

    it('doesnt render the card anymore', () => {
      expect(screen.queryByText(/Visa/)).not.toBeInTheDocument()
    })

    it('renders the form', () => {
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    })

    describe('when submitting', () => {
      beforeEach(() => {
        userEvent.click(screen.queryByRole('button', { name: /save/i }))
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
      useUpdateCard.mockReturnValue([
        jest.fn(),
        { error: { message: randomError } },
      ])
      setup(subscriptionDetail)
      userEvent.click(screen.getByRole('button', { name: /edit card/i }))
    })

    it('renders the error', () => {
      expect(screen.getByText(randomError)).toBeInTheDocument()
    })
  })

  describe('when the form is loading', () => {
    beforeEach(() => {
      useUpdateCard.mockReturnValue([jest.fn(), { isLoading: true }])
      setup(subscriptionDetail)
      userEvent.click(screen.getByRole('button', { name: /edit card/i }))
    })

    it('has the error and save button disabled', () => {
      expect(screen.queryByRole('button', { name: /save/i })).toBeDisabled()
      expect(screen.queryByRole('button', { name: /cancel/i })).toBeDisabled()
    })
  })
})
