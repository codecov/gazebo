import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useUpgradePlan } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

import UpgradePlanForm from './UpgradePlanForm'

jest.mock('services/account/hooks')
jest.mock('services/toastNotification')

const freePlan = {
  marketingName: 'Basic',
  value: 'users-free',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  quantity: 5,
}

const proPlanMonth = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappm',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priorty Support',
  ],
  quantity: 12,
}

const proPlanYear = {
  marketingName: 'Pro Team',
  value: 'users-pr-inappy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priorty Support',
  ],
  quantity: 17,
}

describe('UpgradePlanForm', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()
  let testLocation
  let props

  const defaultProps = {
    owner: 'codecov',
    provider: 'gh',
    proPlanMonth,
    proPlanYear,
    accountDetails: {
      activatedUserCount: 9,
      inactiveUserCount: 0,
      plan: null,
      latestInvoice: null,
    },
  }

  function setup(
    selectedPlan = null,
    invoice = null,
    accountDetails = defaultProps.accountDetails
  ) {
    props = {
      ...defaultProps,
      accountDetails: {
        ...accountDetails,
        plan: selectedPlan,
        latestInvoice: invoice,
      },
    }
    useAddNotification.mockReturnValue(addNotification)
    useUpgradePlan.mockReturnValue({ mutate, isLoading: false })
    render(
      <MemoryRouter initialEntries={['/my/initial/route']}>
        <UpgradePlanForm {...props} />
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )
  }

  function clearSeatsInput() {
    const input = screen.getByRole('spinbutton')
    return userEvent.type(input, '{backspace}{backspace}{backspace}')
  }

  describe('when the user doesnt have any plan', () => {
    beforeEach(() => {
      setup()
    })

    it('renders Dropdown with the year plan selected', () => {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        'annually User Pricing'
      )
    })

    it('renders the seat input with 6 seats', () => {
      expect(screen.getByRole('spinbutton').value).toBe('6')
    })
  })

  describe('when the user have a free plan', () => {
    beforeEach(() => {
      setup(freePlan)
    })

    it('renders Dropdown with the year plan selected', () => {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        'annually User Pricing'
      )
    })

    it('renders the seat input with 6 seats', () => {
      expect(screen.getByRole('spinbutton')).toHaveValue(6)
    })
  })

  describe('when the user have a pro year plan', () => {
    beforeEach(async () => {
      await act(async () => await setup(proPlanYear))
    })

    it('renders Dropdown with the year plan selected', () => {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent(
        'annually User Pricing'
      )
    })

    it('renders the seat input with 17 seats (existing subscription)', () => {
      expect(screen.getByRole('spinbutton')).toHaveValue(17)
    })

    it('has the pricing information of the month price and discount', () => {
      const price = screen.getByText(/\$2,448/)
      expect(price).toBeInTheDocument()
    })

    it('has the price for the year', () => {
      const price = screen.getByText(/\$2,040/)
      expect(price).toBeInTheDocument()
    })

    describe('when updating to a year plan', () => {
      beforeEach(() => {
        return act(async () => {
          await userEvent.click(screen.getAllByRole('button')[0])
          userEvent.click(screen.getAllByRole('option')[1])
        })
      })

      it('has the price for the month', () => {
        const price = screen.getByText(/\$204/)
        expect(price).toBeInTheDocument()
      })
    })
  })

  describe('if there is are students', () => {
    it('renders text for 1 student not taking active seats', () => {
      const accountDetails = {
        activatedUserCount: 9,
        inactiveUserCount: 0,
        plan: null,
        latestInvoice: null,
        activatedStudentCount: 1,
      }
      setup(freePlan, null, accountDetails)

      const studentText = screen.getByText(
        /\*You have 1 active student that does not count towards the number of active users./
      )
      expect(studentText).toBeInTheDocument()
    })

    it('renders text for 2 or more student not taking active seats', () => {
      const accountDetails = {
        activatedUserCount: 9,
        inactiveUserCount: 0,
        plan: null,
        latestInvoice: null,
        activatedStudentCount: 3,
      }
      setup(freePlan, null, accountDetails)

      const studentText = screen.getByText(
        /\*You have 3 active students that do not count towards the number of active users./
      )
      expect(studentText).toBeInTheDocument()
    })
  })

  describe('if there is an invoice', () => {
    beforeEach(async () => {
      await act(async () => {
        const invoice = {
          periodStart: 1595270468,
          periodEnd: 1597948868,
          dueDate: '1600544863',
          amountPaid: 9600.0,
          amountDue: 9600.0,
          amountRemaining: 0.0,
          total: 9600.0,
          subtotal: 9600.0,
          invoicePdf:
            'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_Hs2qfFwArnp6AMjWPlwtyqqszoBzO3q/pdf',
        }
        await setup(proPlanMonth, invoice)
      })
    })

    it('renders the next billing period', () => {
      expect(screen.getByText(/Next Billing Date/)).toBeInTheDocument()
      expect(screen.getByText(/August 20th, 2020/)).toBeInTheDocument()
    })
  })

  describe('when the user leave the nb of seats blank', () => {
    beforeEach(() => {
      setup()
      return act(async () => {
        await clearSeatsInput()
        userEvent.click(screen.getByRole('button', { name: 'Update' }))
      })
    })

    it('displays an error', () => {
      const error = screen.getByText(/Number of seats is required/)
      expect(error).toBeInTheDocument()
    })
  })

  describe('when the user chooses less than 6 seats', () => {
    beforeEach(() => {
      setup()
      return act(async () => {
        clearSeatsInput()
        await userEvent.type(screen.getByRole('spinbutton'), '1')
        userEvent.click(screen.getByRole('button', { name: 'Update' }))
      })
    })

    it('displays an error', () => {
      const error = screen.getByText(
        /You cannot purchase a per user plan for less than 6 users/
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when the user chooses less than the number of active users', () => {
    beforeEach(() => {
      setup()
      return act(async () => {
        clearSeatsInput()
        await userEvent.type(screen.getByRole('spinbutton'), '8')
        userEvent.click(screen.getByRole('button', { name: 'Update' }))
      })
    })

    it('displays an error', () => {
      const error = screen.getByText(
        / deactivate more users before downgrading plans/
      )
      expect(error).toBeInTheDocument()
    })
  })

  describe('when clicking on the button to upgrade', () => {
    beforeEach(() => {
      setup()
      return act(async () => {
        clearSeatsInput()
        await userEvent.type(screen.getByRole('spinbutton', /seats/i), '20')
        const button = screen.getByRole('button', { name: 'Update' })
        button.disabled = false
        userEvent.click(button)
      })
    })

    it('calls the mutation', () => {
      expect(mutate).toHaveBeenCalled()
    })

    describe('when mutation is successful', () => {
      beforeEach(() => {
        // simulating the onSuccess callback given to mutate
        mutate.mock.calls[0][1].onSuccess()
      })

      it('adds a success notification', () => {
        expect(addNotification).toHaveBeenCalledWith({
          type: 'success',
          text: 'Plan successfully upgraded',
        })
      })

      it('redirects the user to the billing page', () => {
        expect(testLocation.pathname).toEqual('/account/gh/codecov/billing')
      })
    })

    describe('when mutation is not successful', () => {
      it('adds an error notification with detail message', () => {
        mutate.mock.calls[0][1].onError({
          data: { detail: 'Insufficent funds.' },
        })

        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Insufficent funds.',
        })
      })

      it('adds a default error notification with no detail message', () => {
        mutate.mock.calls[0][1].onError({
          data: {},
        })

        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong',
        })

        mutate.mock.calls[0][1].onError({
          data: undefined,
        })

        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong',
        })

        mutate.mock.calls[0][1].onError(undefined)

        expect(addNotification).toHaveBeenCalledWith({
          type: 'error',
          text: 'Something went wrong',
        })
      })
    })
  })
})
