import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { BillingRate, Plans } from 'shared/utils/billing'

import PlanUpgradePro from './PlanUpgradePro'

vi.mock('../ProPlanSubheading', () => ({ default: () => 'Pro Subheading' }))
vi.mock('../../shared/ActionsBilling/ActionsBilling', () => ({
  default: () => 'Actions Billing',
}))
vi.mock('shared/plan/BenefitList', () => ({ default: () => 'BenefitsList' }))

const plansWithoutSentryOptions = [
  {
    marketingName: 'Basic',
    value: Plans.USERS_DEVELOPER,
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
    billingRate: BillingRate.MONTHLY,
    baseUnitPrice: 789,
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
    value: Plans.USERS_PR_INAPPY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 456,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
]

const plansWithSentryOptions = [
  {
    marketingName: 'Basic',
    value: Plans.USERS_DEVELOPER,
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
    billingRate: BillingRate.MONTHLY,
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
  },
  {
    marketingName: 'Sentry',
    value: Plans.USERS_SENTRYM,
    billingRate: null,
    baseUnitPrice: 12,
    benefits: ['Includes 5 seats', 'Unlimited public repositories'],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Sentry',
    value: Plans.USERS_SENTRYY,
    billingRate: null,
    baseUnitPrice: 123,
    benefits: ['Includes 5 seats', 'Unlimited private repositories'],
    monthlyUploadLimit: null,
  },
]

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

afterEach(() => {
  queryClient.clear()
  vi.clearAllMocks()
})

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/bb/critical-role']}>
      <Route path="/plan/:provider/:owner">
        <Suspense fallback={<p>Loading</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('PlanUpgradePro', () => {
  describe('when rendered with a sentry plan', () => {
    it('shows sentry marketing name', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const marketingName = await screen.findByText(/Sentry plan/)
      expect(marketingName).toBeInTheDocument()
    })

    it('shows the subheading', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const subheading = await screen.findByText(/Pro Subheading/)
      expect(subheading).toBeInTheDocument()
    })

    it('shows the benefits list', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const benefitsList = await screen.findByText(/BenefitsList/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('shows sentry up to 5 users price', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const sentryPrice = await screen.findByText(/29/)
      expect(sentryPrice).toBeInTheDocument()
    })

    it('shows sentry above 5 users price', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const annualSentryPrice = await screen.findByText(/12/)
      expect(annualSentryPrice).toBeInTheDocument()
    })

    it('shows the actions billing component', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const actionsBilling = await screen.findByText(/Actions Billing/)
      expect(actionsBilling).toBeInTheDocument()
    })
  })

  describe('when rendered with pro plan', () => {
    it('shows pro marketing name', async () => {
      render(
        <PlanUpgradePro
          isSentryUpgrade={false}
          plans={plansWithoutSentryOptions}
        />,
        {
          wrapper,
        }
      )

      const marketingName = await screen.findByText(/Pro Team plan/)
      expect(marketingName).toBeInTheDocument()
    })

    it('shows the subheading', async () => {
      render(
        <PlanUpgradePro
          isSentryUpgrade={false}
          plans={plansWithoutSentryOptions}
        />,
        {
          wrapper,
        }
      )

      const subheading = await screen.findByText(/Pro Subheading/)
      expect(subheading).toBeInTheDocument()
    })

    it('shows the benefits list', async () => {
      render(
        <PlanUpgradePro
          isSentryUpgrade={false}
          plans={plansWithoutSentryOptions}
        />,
        {
          wrapper,
        }
      )

      const benefitsList = await screen.findByText(/BenefitsList/)
      expect(benefitsList).toBeInTheDocument()
    })

    it('shows pro monthly price', async () => {
      render(
        <PlanUpgradePro
          isSentryUpgrade={false}
          plans={plansWithoutSentryOptions}
        />,
        {
          wrapper,
        }
      )

      const monthlyProPrice = await screen.findByText(/789/)
      expect(monthlyProPrice).toBeInTheDocument()
    })

    it('does not shows pro yearly price', async () => {
      render(
        <PlanUpgradePro
          isSentryUpgrade={false}
          plans={plansWithoutSentryOptions}
        />,
        {
          wrapper,
        }
      )

      const yearlyProPrice = screen.queryByText(/456/)
      expect(yearlyProPrice).not.toBeInTheDocument()
    })

    it('shows the actions billing component', async () => {
      render(
        <PlanUpgradePro
          isSentryUpgrade={false}
          plans={plansWithoutSentryOptions}
        />,
        {
          wrapper,
        }
      )

      const actionsBilling = await screen.findByText(/Actions Billing/)
      expect(actionsBilling).toBeInTheDocument()
    })
  })
})
