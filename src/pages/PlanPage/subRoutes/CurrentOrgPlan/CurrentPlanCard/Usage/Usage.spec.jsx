import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { usePlanPageData } from 'pages/PlanPage/hooks'

import Usage from '.'

jest.mock('pages/PlanPage/hooks')

const defaultAccountDetails = {
  activatedStudentCount: 0,
  activatedUserCount: 2,
  checkoutSessionId: null,
  email: null,
  inactiveUserCount: 1,
  integrationId: null,
  name: 'hackreactor',
  nbActivePrivateRepos: 0,
  plan: {
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
    billingRate: null,
    marketingName: 'Basic',
    quantity: 5,
    value: 'users-basic',
  },
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const mockOwner = {
  username: 'TerrySmithDC',
  isCurrentUserPartOfOrg: true,
  numberOfUploads: 250,
}

describe('Usage', () => {
  function setup(overrideAccDetails = {}, isBasicPlan = true) {
    usePlanPageData.mockReturnValue({ data: mockOwner })

    const props = {
      accountDetails: {
        ...defaultAccountDetails,
        ...overrideAccDetails,
      },
      isBasicPlan,
    }

    render(
      <MemoryRouter initialEntries={['/gh/codecov/billing']}>
        <QueryClientProvider client={queryClient}>
          <Usage {...props} />
        </QueryClientProvider>
      </MemoryRouter>
    )
  }

  describe('when rendered with valid account data and a free plan', () => {
    beforeEach(() => {
      setup()
    })

    it('renders usage of users', () => {
      expect(screen.getByText(/2 of 5 users/)).toBeInTheDocument()
    })

    it('renders number of uploads', () => {
      expect(
        screen.getByText(/250 of 250 uploads - trailing 30 days/)
      ).toBeInTheDocument()
    })

    it('renders progress bar', () => {
      expect(screen.getByTestId(/org-progress-bar/)).toBeInTheDocument()
    })

    it('renders the warning exceed warning', () => {
      expect(
        screen.getByText(/usage exceeded upload limit/)
      ).toBeInTheDocument()
    })

    it('renders warning icon', () => {
      expect(screen.getByText(/exclamation.svg/)).toBeInTheDocument()
    })

    it('renders the upgrade tip', () => {
      expect(
        screen.getByText(/upgrade to 6 users for unlimited uploads/)
      ).toBeInTheDocument()
    })
  })

  describe('when rendered with valid account data and not a free plan', () => {
    beforeEach(() => {
      setup({}, false)
    })

    it('renders usage of users', () => {
      expect(screen.getByText(/2 of 5 users/)).toBeInTheDocument()
    })

    it('does not render number of uploads', () => {
      expect(
        screen.queryByText(/250 of 250 uploads month/)
      ).not.toBeInTheDocument()
    })
  })
})
