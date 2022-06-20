import { render, screen } from 'custom-testing-library'

import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route } from 'react-router-dom'

import { useAccountDetails, useCancelPlan, usePlans } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

import CancelPlan from './CancelPlan'

jest.mock('services/account/hooks')
jest.mock('services/toastNotification')

const provider = 'gh'
const owner = 'codecov'

const proPlan = {
  marketingName: 'Pro Team',
  baseUnitPrice: 12,
  benefits: ['Configureable # of users', 'Unlimited repos'],
  quantity: 5,
  value: 'users-inappm',
}

const basicPlan = {
  marketingName: 'Basic',
  value: 'users-free',
  billingRate: null,
  quantity: 1,
  baseUnitPrice: 0,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
}

describe('CancelPlan', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()
  let testLocation

  function setup(currentPlan = proPlan) {
    useAddNotification.mockReturnValue(addNotification)
    useAccountDetails.mockReturnValue({
      data: {
        plan: currentPlan,
        activatedUserCount: 2,
        inactiveUserCount: 1,
        subscriptionDetail: {
          currentPeriodEnd: 1638614662,
        },
      },
    })
    usePlans.mockReturnValue({
      data: getPlans(),
    })
    useCancelPlan.mockReturnValue({ mutate, isLoading: false })
    const { unmount } = render(
      <MemoryRouter initialEntries={['/my/initial/route']}>
        <CancelPlan provider={provider} owner={owner} />
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    )

    return { unmount }
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the basic plan title', () => {
      const tab = screen.getByText(/Basic/)
      expect(tab).toBeInTheDocument()
    })

    it('renders the downgrade button title', () => {
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Downgrade to Free')
    })

    it('loads the baremetrics script', () => {
      expect(window.barecancel.created).toBeTruthy()
    })
  })

  describe('when clicking on the button to downgrade', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByRole('button', { name: /Downgrade to Free/ }))
    })

    it('opens the modal with warning', () => {
      expect(
        screen.getByText(/Are you sure you want to cancel your plan?/)
      ).toBeInTheDocument()
    })

    describe('when clicking submit', () => {
      beforeEach(() => {
        userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
      })

      it('closes the modal', () => {
        expect(
          screen.queryByText(/Are you sure you want to cancel your plan?/)
        ).not.toBeInTheDocument()
      })
    })

    describe('when clicking the X icon', () => {
      beforeEach(() => {
        userEvent.click(screen.queryAllByRole('button', { name: /Close/ })[0])
      })

      it('closes the modal', () => {
        expect(
          screen.queryByText(/Are you sure you want to cancel your plan?/)
        ).not.toBeInTheDocument()
      })
    })

    describe('when clicking cancel', () => {
      beforeEach(() => {
        userEvent.click(screen.queryAllByRole('button', { name: /Close/ })[1])
      })

      it('closes the modal', () => {
        expect(
          screen.queryByText(/Are you sure you want to cancel your plan?/)
        ).not.toBeInTheDocument()
      })
    })
  })

  describe('when calling the mutation', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByRole('button', { name: /Downgrade to Free/ }))
      userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
      // simulating the onSuccess callback given to mutate
      mutate.mock.calls[0][1].onSuccess()
    })

    it('redirects the user to the billing page', () => {
      expect(testLocation.pathname).toEqual('/account/gh/codecov/billing')
    })
  })

  describe('when mutation is not successful', () => {
    beforeEach(() => {
      setup()
      userEvent.click(screen.getByRole('button', { name: /Downgrade to Free/ }))
      userEvent.click(screen.getByRole('button', { name: /Cancel/ }))
      // simulating the onError callback given to mutate
      mutate.mock.calls[0][1].onError()
    })

    it('adds an error notification', () => {
      expect(addNotification).toHaveBeenCalledWith({
        type: 'error',
        text: 'Something went wrong',
      })
    })
  })

  describe('when the user is already on a free plan', () => {
    beforeEach(() => {
      setup(basicPlan)
    })

    it('has the button disabled', () => {
      expect(screen.getByRole('button')).toHaveAttribute('disabled')
    })
  })

  describe('when unmounted', () => {
    beforeEach(() => {
      const { unmount } = setup(basicPlan)
      unmount()
    })

    it('removes the baremetrics script', () => {
      expect(screen.queryByTestId('baremetrics-script')).not.toBeInTheDocument()
    })
  })
})

function getPlans() {
  return [
    {
      marketingName: 'Basic',
      value: 'users-free',
      billingRate: null,
      baseUnitprice: 0,
      benefits: [
        'Up to 5 users',
        'Unlimited public repositories',
        'Unlimited private repositories',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappm',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappy',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisem',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisey',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
  ]
}
