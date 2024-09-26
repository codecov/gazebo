import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import UpgradePlanPage from './UpgradePlanPage'

vi.mock('./UpgradeForm', () => ({ default: () => 'UpgradeForm' }))

const plans = [
  {
    marketingName: 'Basic',
    value: 'users-free',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
    monthlyUploadLimit: 250,
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
    monthlyUploadLimit: null,
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
    monthlyUploadLimit: null,
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
    monthlyUploadLimit: null,
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
    monthlyUploadLimit: null,
  },
]

const sentryPlanMonth = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentrym',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentryy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
}

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
}

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: 'users-basic',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialWrappers = '/plan/gh/codecov/upgrade') =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialWrappers]}>
        <Route path="/plan/:provider/:owner/upgrade">
          <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
      </MemoryRouter>
    </QueryClientProvider>
  )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('UpgradePlanPage', () => {
  function setup(
    {
      planValue = Plans.USERS_INAPPY,
      periodEnd = undefined,
      includeSentryPlans = false,
      includeTeamPlans = false,
    } = {
      planValue: Plans.USERS_INAPPY,
      periodEnd: undefined,
      includeSentryPlans: false,
      includeTeamPlans: false,
    }
  ) {
    server.use(
      graphql.query('GetPlanData', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
              },
            },
          },
        })
      }),
      graphql.query('GetAvailablePlans', (info) => {
        if (includeSentryPlans) {
          return HttpResponse.json({
            data: {
              owner: { availablePlans: [sentryPlanMonth, sentryPlanYear] },
            },
          })
        } else if (includeTeamPlans) {
          return HttpResponse.json({
            data: {
              owner: { availablePlans: [teamPlanMonth, teamPlanYear] },
            },
          })
        } else {
          return HttpResponse.json({
            data: {
              owner: { availablePlans: plans },
            },
          })
        }
      }),
      http.get('/internal/gh/codecov/account-details', (info) => {
        if (planValue === Plans.USERS_SENTRYY) {
          return HttpResponse.json({
            plan: sentryPlanYear,
            subscriptionDetail: {
              cancelAtPeriodEnd: periodEnd,
            },
            activatedUserCount: 10,
          })
        }

        return HttpResponse.json({
          plan: {
            marketingName: 'Pro Team',
            value: planValue,
            baseUnitPrice: 12,
            benefits: [
              'Configurable # of users',
              'Unlimited public repositories',
              'Unlimited private repositories',
              'Priority Support',
            ],
          },
          subscriptionDetail: {
            cancelAtPeriodEnd: periodEnd,
          },
          activatedUserCount: 10,
        })
      })
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the basic plan title', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Pro Team/)
      expect(title).toBeInTheDocument()
    })

    it('renders a cancel plan link', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const cancelLink = await screen.findByText('Cancel')
      expect(cancelLink).toBeInTheDocument()
    })

    it('does not render upgrade banner', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const banner = screen.queryByText(/You are choosing to upgrade/)
      expect(banner).not.toBeInTheDocument()
    })
  })

  describe('when rendered with a free plan', () => {
    it('renders the basic plan title', async () => {
      setup({ planValue: Plans.USERS_BASIC })

      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Pro Team/)
      expect(title).toBeInTheDocument()
    })

    it('does not render a cancel plan link', async () => {
      setup({ planValue: Plans.USERS_BASIC })

      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const cancelLink = screen.queryByText('Cancel')
      expect(cancelLink).not.toBeInTheDocument()
    })

    it('does not render upgrade banner', async () => {
      setup({ planValue: Plans.USERS_BASIC })

      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const banner = screen.queryByText(/You are choosing to upgrade/)
      expect(banner).not.toBeInTheDocument()
    })

    describe('when rendered with a team plan search param', () => {
      it('renders the team plan title', async () => {
        setup({ planValue: Plans.USERS_BASIC, includeTeamPlans: true })
        render(<UpgradePlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/upgrade?plan=team'),
        })

        const teamTitle = await screen.findByText(/Team plan/)
        expect(teamTitle).toBeInTheDocument()
      })

      it('renders the team plan price', async () => {
        setup({ planValue: Plans.USERS_BASIC, includeTeamPlans: true })
        render(<UpgradePlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/upgrade?plan=team'),
        })

        const teamPlanPrice = await screen.findByText(/\$5/)
        expect(teamPlanPrice).toBeInTheDocument()

        const teamPlanPricingScheme = await screen.findByText(/per user\/month/)
        expect(teamPlanPricingScheme).toBeInTheDocument()
      })

      it('renders the team plan benefits', async () => {
        setup({ planValue: Plans.USERS_BASIC, includeTeamPlans: true })
        render(<UpgradePlanPage />, {
          wrapper: wrapper('/plan/gh/codecov/upgrade?plan=team'),
        })

        const userCount = await screen.findByText(/Up to 10 users/)
        expect(userCount).toBeInTheDocument()
      })
    })
  })

  describe('when rendered with an enterprise plan', () => {
    beforeEach(() => {
      setup({ planValue: Plans.USERS_ENTERPRISEM })
    })

    it('redirects user to plan page', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov')
      )
    })
  })

  describe('when account has already cancelled plan', () => {
    beforeEach(() => {
      setup({ planValue: Plans.USERS_INAPPY, periodEnd: true })
    })

    it('does not render cancel plan link', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitForElementToBeRemoved(screen.queryByText('Loading...'))

      const cancelLink = screen.queryByText('Cancel plan')
      expect(cancelLink).not.toBeInTheDocument()
    })
  })

  describe('when rendered when a sentry plan', () => {
    beforeEach(() =>
      setup({ planValue: Plans.USERS_SENTRYY, includeSentryPlans: true })
    )

    it('renders the sentry plan title', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Sentry Pro Team/)
      expect(title).toBeInTheDocument()
    })
  })
})
