import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import config from 'config'

import { BillingRate, PlanName, Plans } from 'shared/utils/billing'

import ActivationBanner from './ActivationBanner'

vi.mock('./TrialEligibleBanner', () => ({
  default: () => 'TrialEligibleBanner',
}))
vi.mock('./ActivationRequiredBanner', () => ({
  default: () => 'ActivationRequiredBanner',
}))
vi.mock('./FreePlanSeatsLimitBanner', () => ({
  default: () => 'FreePlanSeatsLimitBanner',
}))
vi.mock('./PaidPlanSeatsLimitBanner', () => ({
  default: () => 'PaidPlanSeatsLimitBanner',
}))
vi.mock('./ActivationRequiredSelfHosted', () => ({
  default: () => 'ActivationRequiredSelfHostedBanner',
}))

const queryClient = new QueryClient()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/gazebo/new']}>
      <Route path="/:provider/:owner/:repo/new">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

const server = setupServer()

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

const mockTrialData = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Developer',
  monthlyUploadLimit: 250,
  value: Plans.USERS_DEVELOPER,
  trialStatus: 'ONGOING',
  trialStartDate: '2023-01-01T08:55:25',
  trialEndDate: '2023-01-10T08:55:25',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isProPlan: false,
  isSentryPlan: false,
  isTrialPlan: false,
}

describe('ActivationBanner', () => {
  function setup(
    privateRepos = true,
    trialStatus = 'NOT_STARTED',
    value: PlanName = Plans.USERS_DEVELOPER,
    hasSeatsLeft = true,
    isSelfHosted = false
  ) {
    config.IS_SELF_HOSTED = isSelfHosted

    server.use(
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: privateRepos,
              plan: {
                ...mockTrialData,
                trialStatus,
                value,
                hasSeatsLeft,
                isFreePlan: value === Plans.USERS_DEVELOPER,
                isTeamPlan:
                  value === Plans.USERS_TEAMM || value === Plans.USERS_TEAMY,
              },
              pretrialPlan: {
                baseUnitPrice: 10,
                benefits: [],
                billingRate: BillingRate.MONTHLY,
                marketingName: 'Users Developer',
                monthlyUploadLimit: 250,
                value: Plans.USERS_DEVELOPER,
              },
            },
          },
        })
      })
    )
  }

  it('renders trial eligible banner if user is eligible to trial', async () => {
    setup()
    render(<ActivationBanner />, { wrapper })

    const trialEligibleBanner = await screen.findByText(/TrialEligibleBanner/)
    expect(trialEligibleBanner).toBeInTheDocument()
  })

  it('does not render trial eligible banner if user is not eligible to trial', async () => {
    setup(false, 'ONGOING', Plans.USERS_DEVELOPER, true)
    const { container } = render(<ActivationBanner />, { wrapper })

    await waitFor(() => queryClient.isFetching)
    await waitFor(() => !queryClient.isFetching)

    await waitFor(() => expect(container).toBeEmptyDOMElement())
  })

  it('renders activation required banner if user is not on free plan and has seats left', async () => {
    setup(true, 'ONGOING', Plans.USERS_PR_INAPPM, true)
    render(<ActivationBanner />, { wrapper })

    const ActivationRequiredBanner = await screen.findByText(
      /ActivationRequiredBanner/
    )
    expect(ActivationRequiredBanner).toBeInTheDocument()
  })

  it('renders seats limit reached banner if user has no seats left and on free plan', async () => {
    setup(true, 'ONGOING', Plans.USERS_DEVELOPER, false)
    render(<ActivationBanner />, { wrapper })

    const FreePlanSeatsLimitBanner = await screen.findByText(
      /FreePlanSeatsLimitBanner/
    )
    expect(FreePlanSeatsLimitBanner).toBeInTheDocument()
  })

  it('renders seats limit reached banner if user has no seats left and on paid plan', async () => {
    setup(true, 'ONGOING', Plans.USERS_PR_INAPPY, false)
    render(<ActivationBanner />, { wrapper })

    const PaidPlanSeatsLimitBanner = await screen.findByText(
      /PaidPlanSeatsLimitBanner/
    )
    expect(PaidPlanSeatsLimitBanner).toBeInTheDocument()
  })

  it('renders activation required self hosted banner if user is self hosted', async () => {
    setup(true, 'ONGOING', Plans.USERS_DEVELOPER, true, true)
    render(<ActivationBanner />, { wrapper })

    const ActivationRequiredSelfHostedBanner = await screen.findByText(
      /ActivationRequiredSelfHostedBanner/
    )
    expect(ActivationRequiredSelfHostedBanner).toBeInTheDocument()
  })
})
