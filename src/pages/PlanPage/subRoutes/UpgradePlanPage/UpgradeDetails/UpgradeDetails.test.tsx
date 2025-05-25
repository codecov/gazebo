import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { BillingRate, Plans } from 'shared/utils/billing'

import UpgradeDetails from './UpgradeDetails'

vi.mock('./SentryPlanDetails', () => ({
  default: () => 'Sentry Plan Details',
}))
vi.mock('./ProPlanDetails', () => ({
  default: () => 'Pro Plan Details',
}))
vi.mock('./TeamPlanDetails', () => ({
  default: () => 'Team Plan Details',
}))

const proPlanYear = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPY,
  billingRate: BillingRate.ANNUALLY,
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: false,
}

const proPlanMonth = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: false,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro',
  baseUnitPrice: 10,
  value: Plans.USERS_SENTRYY,
  billingRate: BillingRate.ANNUALLY,
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

const sentryPlanMonth = {
  marketingName: 'Sentry Pro',
  baseUnitPrice: 10,
  value: Plans.USERS_SENTRYM,
  billingRate: BillingRate.MONTHLY,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  isSentryPlan: true,
  isTeamPlan: false,
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
  isTeamPlan: true,
  isSentryPlan: false,
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
  isTeamPlan: true,
  isSentryPlan: false,
}

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>
const wrapper: WrapperClosure =
  (initialEntries = ['/plan/gh/codecov/upgrade']) =>
  ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Route path="/plan/:provider/:owner/upgrade">
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  )

describe('UpgradeDetails', () => {
  describe('yearly plans', () => {
    describe('when user can apply team plan', () => {
      it('renders team plan details component', async () => {
        render(<UpgradeDetails selectedPlan={teamPlanYear} />, {
          wrapper: wrapper(),
        })

        const teamPlanDetails = await screen.findByText(/Team Plan Details/)
        expect(teamPlanDetails).toBeInTheDocument()
      })
    })

    describe('when user can apply sentry plan', () => {
      it('renders sentry plan details component', async () => {
        render(<UpgradeDetails selectedPlan={sentryPlanYear} />, {
          wrapper: wrapper(),
        })

        const sentryPlanDetails = await screen.findByText(/Sentry Plan Details/)
        expect(sentryPlanDetails).toBeInTheDocument()
      })
    })

    describe('user cannot apply sentry plan', () => {
      it('renders pro plan details component', async () => {
        render(<UpgradeDetails selectedPlan={proPlanYear} />, {
          wrapper: wrapper(),
        })

        const proPlanDetails = await screen.findByText(/Pro Plan Details/)
        expect(proPlanDetails).toBeInTheDocument()
      })
    })
  })
  describe('monthly plans', () => {
    describe('when user can apply monthly team plan', () => {
      it('renders team plan details component', async () => {
        render(<UpgradeDetails selectedPlan={teamPlanMonth} />, {
          wrapper: wrapper(),
        })

        const teamPlanDetails = await screen.findByText(/Team Plan Details/)
        expect(teamPlanDetails).toBeInTheDocument()
      })
    })

    describe('when user can apply monthly sentry plan', () => {
      it('renders sentry plan details component', async () => {
        render(<UpgradeDetails selectedPlan={sentryPlanMonth} />, {
          wrapper: wrapper(),
        })

        const sentryPlanDetails = await screen.findByText(/Sentry Plan Details/)
        expect(sentryPlanDetails).toBeInTheDocument()
      })
    })

    describe('user cannot apply monthly sentry plan', () => {
      it('renders pro plan details component', async () => {
        render(<UpgradeDetails selectedPlan={proPlanMonth} />, {
          wrapper: wrapper(),
        })

        const proPlanDetails = await screen.findByText(/Pro Plan Details/)
        expect(proPlanDetails).toBeInTheDocument()
      })
    })
  })
})
