import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import PlanUpgradePro from './PlanUpgradePro'

jest.mock('../ProPlanSubheading', () => () => 'Pro Subheading')
jest.mock(
  '../../shared/ActionsBilling/ActionsBilling',
  () => () => 'Actions Billing'
)
jest.mock('shared/plan/BenefitList', () => () => 'BenefitsList')

const plansWithoutSentryOptions = [
  {
    marketingName: 'Basic',
    value: 'users-basic',
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
    value: 'users-pr-inappy',
    billingRate: 'annually',
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
    value: 'users-basic',
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
    marketingName: 'Sentry',
    value: 'users-sentrym',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: ['Includes 5 seats', 'Unlimited public repositories'],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentryy',
    billingRate: null,
    baseUnitPrice: 123,
    benefits: ['Includes 5 seats', 'Unlimited private repositories'],
    monthlyUploadLimit: null,
  },
]

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  jest.resetAllMocks()
})

afterAll(() => {
  server.close()
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

    it('shows sentry price', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const sentryPrice = await screen.findByText(/29/)
      expect(sentryPrice).toBeInTheDocument()
    })

    it('shows sentry annual price', async () => {
      render(
        <PlanUpgradePro isSentryUpgrade plans={plansWithSentryOptions} />,
        {
          wrapper,
        }
      )

      const annualSentryPrice = await screen.findByText(/123/)
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

    it('shows pro yearly price', async () => {
      render(
        <PlanUpgradePro
          isSentryUpgrade={false}
          plans={plansWithoutSentryOptions}
        />,
        {
          wrapper,
        }
      )

      const yearlyProPrice = await screen.findByText(/456/)
      expect(yearlyProPrice).toBeInTheDocument()
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
