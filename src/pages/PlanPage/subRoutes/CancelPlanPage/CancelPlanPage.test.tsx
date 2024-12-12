import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import CancelPlanPage from './CancelPlanPage'

vi.mock('./subRoutes/SpecialOffer', () => ({ default: () => 'SpecialOffer' }))
vi.mock('./subRoutes/DowngradePlan', () => ({ default: () => 'DowngradePlan' }))
vi.mock('./subRoutes/TeamPlanSpecialOffer', () => ({
  default: () => 'TeamPlanSpecialOffer',
}))

const teamPlans = [
  {
    baseUnitPrice: 6,
    benefits: ['Up to 10 users'],
    billingRate: 'monthly',
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: Plans.USERS_TEAMM,
  },
  {
    baseUnitPrice: 5,
    benefits: ['Up to 10 users'],
    billingRate: 'yearly',
    marketingName: 'Users Team',
    monthlyUploadLimit: 2500,
    value: Plans.USERS_TEAMY,
  },
]

const mockAvailablePlans = ({ hasTeamPlans }: { hasTeamPlans: boolean }) => [
  {
    marketingName: 'Basic',
    value: Plans.USERS_BASIC,
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
    value: Plans.USERS_PR_INAPPM,
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
  ...(hasTeamPlans ? teamPlans : []),
]

const mockPlanData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Users Basic',
  monthlyUploadLimit: 250,
  value: Plans.USERS_BASIC,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
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

let testLocation: { pathname: string }
const wrapper =
  (initialEntries = ''): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/plan/:provider/:owner">{children}</Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </Suspense>
    </QueryClientProvider>
  )

beforeAll(() => {
  server.listen()
})
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

interface SetupProps {
  hasDiscount?: boolean
  planValue?: string
  trialStatus?: string
  hasTeamPlans?: boolean
}

describe('CancelPlanPage', () => {
  function setup({
    hasDiscount = false,
    planValue = Plans.USERS_PR_INAPPM,
    trialStatus = TrialStatuses.NOT_STARTED,
    hasTeamPlans = false,
  }: SetupProps = {}) {
    server.use(
      http.get('internal/gh/codecov/account-details/', () => {
        return HttpResponse.json({
          plan: { value: planValue },
          subscriptionDetail: { customer: { discount: hasDiscount } },
        })
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanData,
                trialStatus,
                value: planValue,
                isEnterprisePlan: planValue === Plans.USERS_ENTERPRISEM,
              },
            },
          },
        })
      }),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: {
            owner: {
              availablePlans: mockAvailablePlans({ hasTeamPlans }),
            },
          },
        })
      })
    )
  }

  describe('user has not applied discount', () => {
    beforeEach(() => setup())

    describe('testing routes', () => {
      describe('on root cancel path', () => {
        it('renders cancel plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel'),
          })

          const specialOffer = await screen.findByText('SpecialOffer')
          expect(specialOffer).toBeInTheDocument()
        })
      })

      describe('on downgrade path', () => {
        it('renders downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/downgrade'),
          })

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on random path', () => {
        it('redirects to root cancel plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/blah'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel')
          )

          const specialOffer = await screen.findByText('SpecialOffer')
          expect(specialOffer).toBeInTheDocument()
        })
      })
    })
  })

  describe('user has discount applied', () => {
    beforeEach(() => setup({ hasDiscount: true }))

    describe('testing routes', () => {
      describe('on root cancel path', () => {
        it('redirects to downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe(
              '/plan/gh/codecov/cancel/downgrade'
            )
          )

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on downgrade path', () => {
        it('renders downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/downgrade'),
          })

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on random cancel path', () => {
        it('redirects to root downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/blah'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe(
              '/plan/gh/codecov/cancel/downgrade'
            )
          )

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })

      describe('on random downgrade path', () => {
        it('redirects to root downgrade plan', async () => {
          render(<CancelPlanPage />, {
            wrapper: wrapper('/plan/gh/codecov/cancel/downgrade/blah'),
          })

          await waitFor(() =>
            expect(testLocation.pathname).toBe(
              '/plan/gh/codecov/cancel/downgrade'
            )
          )

          const downgrade = await screen.findByText('DowngradePlan')
          expect(downgrade).toBeInTheDocument()
        })
      })
    })
  })

  describe('user is on a annual plan', () => {
    beforeEach(() => setup({ planValue: Plans.USERS_INAPPY }))

    it('directs them directly to downgrade page', async () => {
      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov/cancel/downgrade')
      )

      const downgrade = await screen.findByText('DowngradePlan')
      expect(downgrade).toBeInTheDocument()
    })
  })

  describe('user is on an enterprise plan', () => {
    beforeEach(() => setup({ planValue: Plans.USERS_ENTERPRISEM }))

    it('directs them directly to plan page', async () => {
      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov')
      )
    })
  })

  describe('user is on a trial', () => {
    it('directs them directly to plan page', async () => {
      setup({
        planValue: Plans.USERS_TRIAL,
        trialStatus: TrialStatuses.ONGOING,
      })

      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov')
      )
    })
  })

  describe('user has team plans in available plans', () => {
    beforeEach(() => setup({ hasTeamPlans: true }))

    it('renders team plan special offer', async () => {
      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      const specialOffer = await screen.findByText('TeamPlanSpecialOffer')
      expect(specialOffer).toBeInTheDocument()
    })
  })

  describe('user does not have team plans in available plans', () => {
    beforeEach(() => setup({ hasTeamPlans: false }))

    it('renders special offer', async () => {
      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      const specialOffer = await screen.findByText('SpecialOffer')
      expect(specialOffer).toBeInTheDocument()
    })
  })

  describe('user already on team plan', () => {
    beforeEach(() =>
      setup({
        planValue: Plans.USERS_TEAMM,
        hasTeamPlans: true,
      })
    )

    it('shows default cancel offer', async () => {
      render(<CancelPlanPage />, {
        wrapper: wrapper('/plan/gh/codecov/cancel'),
      })

      const specialOffer = await screen.findByText('SpecialOffer')
      expect(specialOffer).toBeInTheDocument()
    })
  })
})
