import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account/usePlanData'
import { BillingRate, Plans } from 'shared/utils/billing'

import BillingOptions from './BillingOptions'

const freePlan = {
  marketingName: 'Basic',
  value: Plans.USERS_DEVELOPER,
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 1 user',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  monthlyUploadLimit: 250,
  isTeamPlan: false,
  isSentryPlan: false,
}

const sentryProTeamMonthly = {
  marketingName: 'Sentry Pro Team',
  value: Plans.USERS_SENTRYM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: true,
}

const sentryProTeamYearly = {
  marketingName: 'Sentry Pro Team',
  value: Plans.USERS_SENTRYY,
  billingRate: BillingRate.ANNUALLY,
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: true,
}

const availablePlans = [freePlan, sentryProTeamMonthly, sentryProTeamYearly]

const mockPlanDataResponse = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Sentry',
  monthlyUploadLimit: 250,
  value: Plans.USERS_SENTRYY,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  freeSeatCount: 0,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isFreePlan: false,
  isProPlan: true,
  isSentryPlan: true,
  isTeamPlan: false,
  isTrialPlan: false,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/upgrade']}>
      <Route path="/:provider/:owner/upgrade">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
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

describe('BillingOptions', () => {
  function setup() {
    server.use(
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({ data: { owner: { availablePlans } } })
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: { hasPrivateRepos: true, plan: mockPlanDataResponse },
          },
        })
      })
    )

    const mockSetFormValue = vi.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue }
  }

  describe('when rendered', () => {
    describe('planString is set to a monthly plan', () => {
      it('renders monthly button as "selected"', async () => {
        setup()

        render(<BillingOptions />, {
          wrapper,
        })

        const annualBtn = screen.queryByTestId('radio-annual')
        expect(annualBtn).not.toBeInTheDocument()

        const monthlyBtn = await screen.findByTestId('radio-monthly')
        expect(monthlyBtn).toBeInTheDocument()
        expect(monthlyBtn).toBeChecked()
      })

      it('renders correct pricing scheme', async () => {
        setup()

        render(<BillingOptions />, {
          wrapper,
        })

        const cost = await screen.findByText(/\$12/)
        expect(cost).toBeInTheDocument()

        const content = await screen.findByText(
          /per seat\/month, billed monthly/
        )
        expect(content).toBeInTheDocument()
      })
    })
  })
})
