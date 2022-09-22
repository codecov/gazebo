import { render, screen } from 'custom-testing-library'

import { MemoryRouter, Route } from 'react-router-dom'

import { useAccountDetails, useCancelPlan, usePlans } from 'services/account'
import { useAddNotification } from 'services/toastNotification'

import CancelPlanPage from './CancelPlanPage'

jest.mock('services/account/hooks')
jest.mock('services/toastNotification')
jest.mock('./CancelButton', () => () => 'Cancel Card')

const provider = 'gh'
const owner = 'codecov'

const proPlan = {
  marketingName: 'Pro Team',
  baseUnitPrice: 12,
  benefits: ['Configurable # of users', 'Unlimited repos'],
  quantity: 5,
  value: 'users-inappm',
}

describe('CancelPlanPage', () => {
  const mutate = jest.fn()
  const addNotification = jest.fn()

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
        <CancelPlanPage provider={provider} owner={owner} />
        <Route
          path="*"
          render={({ location }) => {
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

    it('renders the downgrade button component', () => {
      expect(screen.getByText(/Cancel Card/)).toBeInTheDocument()
    })

    it('renders the title', () => {
      expect(screen.getByText(/Downgrading to Free/)).toBeInTheDocument()
    })

    it('renders cancelation text', () => {
      expect(
        screen.getByText(
          /On downgrade, all users will be automatically deactivated./
        )
      ).toBeInTheDocument()
    })

    it('renders unavailable benefits', () => {
      expect(screen.getByText(/Configurable # of users/)).toBeInTheDocument()
      expect(screen.getByText(/Priority Support/)).toBeInTheDocument()
    })

    it('renders basic plan benefits', () => {
      expect(screen.getByText(/Basic/)).toBeInTheDocument()
      expect(screen.getByText(/Up to 5 users/)).toBeInTheDocument()
      expect(
        screen.getByText(/Unlimited public repositories/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Unlimited private repositories/)
      ).toBeInTheDocument()
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
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappy',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisem',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisey',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
    },
  ]
}
