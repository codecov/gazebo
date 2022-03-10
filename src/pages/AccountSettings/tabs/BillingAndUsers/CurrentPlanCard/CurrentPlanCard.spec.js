import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { MemoryRouter } from 'react-router-dom'

import CurrentPlanCard from './CurrentPlanCard'

const proAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configureable # of users', 'Unlimited repos'],
    quantity: 5,
    value: 'users-inappm',
  },
  activatedUserCount: 2,
}

const freeAccountDetails = {
  plan: {
    marketingName: 'Basic',
    value: 'users-free',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
  },
  activatedUserCount: 2,
}

const queryClient = new QueryClient()

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ provider: 'gl' }),
}))

describe('CurrentPlanCard', () => {
  function setup(accountDetails) {
    render(
      <QueryClientProvider client={queryClient}>
        <CurrentPlanCard accountDetails={accountDetails} />
      </QueryClientProvider>,
      {
        wrapper: MemoryRouter,
      }
    )
  }

  describe('when rendering with a pro plan', () => {
    beforeEach(() => {
      setup(proAccountDetails)
    })

    it('renders the price of the plan', () => {
      expect(screen.getByText(/\$12/)).toBeInTheDocument()
    })

    it('renders the link to Cancel', () => {
      expect(
        screen.getByRole('link', { name: /Cancel Plan/ })
      ).toBeInTheDocument()
    })

    it('shows the help message', () => {
      expect(screen.getByText(/Need help?/)).toBeInTheDocument()
    })
  })

  describe('when rendering with a free plan', () => {
    beforeEach(() => {
      setup(freeAccountDetails)
    })

    it('doesnt render the link to Cancel', () => {
      expect(
        screen.queryByRole('link', { name: /Cancel Plan/ })
      ).not.toBeInTheDocument()
    })

    it('shows the help message', () => {
      expect(screen.getByText(/Need help?/)).toBeInTheDocument()
    })
  })

  describe('when the subscription of the user is expiring', () => {
    beforeEach(() => {
      setup({
        ...proAccountDetails,
        subscriptionDetail: {
          cancelAtPeriodEnd: true,
        },
      })
    })

    it('doesnt render the link to Cancel', () => {
      expect(
        screen.queryByRole('link', { name: /Cancel Plan/ })
      ).not.toBeInTheDocument()
    })

    it('shows the help message', () => {
      expect(screen.getByText(/Need help?/)).toBeInTheDocument()
    })
  })

  describe('when the subscription has scheduled information', () => {
    beforeEach(() => {
      setup({
        ...proAccountDetails,
        scheduleDetail: {
          id: 'sub_sched_sch1K77Y5GlVGuVgOrkJrLjRnne',
          scheduledPhase: {
            plan: 'Annual',
            quantity: 14,
            startDate: 191276319264,
          },
        },
      })
    })

    it('renders scheduled details', () => {
      expect(screen.getByText(/\Scheduled Details/)).toBeInTheDocument()
    })
  })

  describe('when the subscription doesn not have scheduled information', () => {
    beforeEach(() => {
      setup({
        ...proAccountDetails,
        scheduleDetail: {
          id: null,
        },
      })
    })

    it('renders doesn not render scheduled details', () => {
      expect(screen.queryByText(/\Scheduled Details/)).not.toBeInTheDocument()
    })
  })

  describe('when the user is using github marketplace', () => {
    beforeEach(() => {
      setup({
        ...freeAccountDetails,
        planProvider: 'github',
      })
    })

    it('renders a link to the github marketplace', () => {
      expect(
        screen.getByRole('link', { name: /Manage billing in GitHub/ })
      ).toBeInTheDocument()
    })

    it('shows the help message', () => {
      expect(screen.getByText(/Need help?/)).toBeInTheDocument()
    })
  })

  describe('when the owner is a Gitlab subgroup', () => {
    const parentUsername = 'parent'

    beforeEach(() => {
      setup({
        ...freeAccountDetails,
        rootOrganization: {
          ...proAccountDetails,
          username: parentUsername,
        },
      })
    })

    it('renders the plan of the parent', () => {
      expect(
        screen.getByRole('heading', {
          name: /pro team/i,
        })
      ).toBeInTheDocument()
    })

    it('renders a link to the billing page of the parent', () => {
      const link = screen.getByRole('link', {
        name: /view billing/i,
      })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute(
        'href',
        `/account/gl/${parentUsername}/billing`
      )
    })

    it('shows the help message', () => {
      expect(screen.getByText(/Need help?/)).toBeInTheDocument()
    })
  })
})
