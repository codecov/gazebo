import { render, screen } from '@testing-library/react'

import { BillingRate, Plans } from 'shared/utils/billing'

import Controller from './Controller'

vi.mock('./ProPlanController', () => ({ default: () => 'Pro Plan Controller' }))
vi.mock('./SentryPlanController', () => ({
  default: () => 'Sentry Plan Controller',
}))
vi.mock('./TeamPlanController', () => ({
  default: () => 'Team Plan Controller',
}))

const proPlanMonth = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
  monthlyUploadLimit: null,
}

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
  quantity: 13,
}

const sentryPlanMonth = {
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
  trialDays: 14,
  quantity: 10,
}

const sentryPlanYear = {
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
  trialDays: 14,
  quantity: 21,
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
}

const teamPlanYear = {
  baseUnitPrice: 4,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
}

describe('Controller', () => {
  describe('Form Controller', () => {
    describe('when plan is a codecov pro plan', () => {
      it('renders Pro Plan Controller for yearly plan', async () => {
        const props = {
          seats: 10,
          register: vi.fn(),
          setFormValue: vi.fn(),
          setSelectedPlan: vi.fn(),
          newPlan: proPlanYear,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const proPlanController = await screen.findByText(/Pro Plan Controller/)
        expect(proPlanController).toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })

      it('renders Pro Plan Controller for monthly plan', async () => {
        const props = {
          seats: 10,
          register: vi.fn(),
          setFormValue: vi.fn(),
          setSelectedPlan: vi.fn(),
          newPlan: proPlanMonth,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const proPlanController = await screen.findByText(/Pro Plan Controller/)
        expect(proPlanController).toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })
    })

    describe('when plan is a sentry pro plan', () => {
      it('renders Sentry Plan Controller for yearly plan', async () => {
        const props = {
          seats: 10,
          register: vi.fn(),
          setFormValue: vi.fn(),
          setSelectedPlan: vi.fn(),
          newPlan: sentryPlanYear,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const sentryPlanController = await screen.findByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })

      it('renders Sentry Plan Controller for monthly plan', async () => {
        const props = {
          seats: 10,
          register: vi.fn(),
          setFormValue: vi.fn(),
          setSelectedPlan: vi.fn(),
          newPlan: sentryPlanMonth,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const sentryPlanController = await screen.findByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const teamPlanController = screen.queryByText(/Team Plan Controller/)
        expect(teamPlanController).not.toBeInTheDocument()
      })
    })

    describe('when plan is a team plan', () => {
      it('renders Team Plan Controller for yearly plan', async () => {
        const props = {
          seats: 10,
          register: vi.fn(),
          setFormValue: vi.fn(),
          setSelectedPlan: vi.fn(),
          newPlan: teamPlanYear,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const teamPlanController =
          await screen.findByText(/Team Plan Controller/)
        expect(teamPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()
      })

      it('renders Team Plan Controller for monthly plan', async () => {
        const props = {
          seats: 10,
          register: vi.fn(),
          setFormValue: vi.fn(),
          setSelectedPlan: vi.fn(),
          newPlan: teamPlanMonth,
          errors: { seats: { message: '' } },
        }
        render(<Controller {...props} />)

        const teamPlanController =
          await screen.findByText(/Team Plan Controller/)
        expect(teamPlanController).toBeInTheDocument()

        const proPlanController = screen.queryByText(/Pro Plan Controller/)
        expect(proPlanController).not.toBeInTheDocument()

        const sentryPlanController = screen.queryByText(
          /Sentry Plan Controller/
        )
        expect(sentryPlanController).not.toBeInTheDocument()
      })
    })
  })
})
