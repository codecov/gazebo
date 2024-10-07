import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

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
}

const proPlanMonth = {
  marketingName: 'Pro',
  value: 'users-pr-inappm',
  billingRate: 'monthly',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro',
  baseUnitPrice: 10,
  value: 'users-sentryy',
  billingRate: 'annually',
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
}

const sentryPlanMonth = {
  marketingName: 'Sentry Pro',
  baseUnitPrice: 10,
  value: 'users-sentrym',
  billingRate: 'monthly',
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
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
