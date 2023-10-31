import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import UpgradeDetails from './UpgradeDetails'

const proPlanMonth = {
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
  quantity: 10,
}

const proPlanYear = {
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
  quantity: 10,
}

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
  trialDays: 14,
}

const freePlan = {
  marketingName: 'Basic',
  value: 'users-free',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
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
}

const trialPlan = {
  marketingName: 'Try Codecov Pro',
  value: 'users-trial',
  billingRate: 'monthly',
  baseUnitPrice: 0,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false, suspense: true } },
})

const wrapper =
  (initialEntries = '/plan/gh/codecov/upgrade') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntries]}>
          <Route path="/plan/:provider/:owner/upgrade">
            <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
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

describe('UpgradeDetails', () => {
  function setup({ isOngoingTrial = false } = { isOngoingTrial: false }) {
    server.use(
      graphql.query('GetPlanData', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              plan: {
                ...mockPlanData,
                trialStatus: isOngoingTrial
                  ? TrialStatuses.ONGOING
                  : TrialStatuses.CANNOT_TRIAL,
                value: isOngoingTrial ? Plans.USERS_TRIAL : Plans.USERS_BASIC,
              },
            },
          })
        )
      )
    )
  }

  describe('users can apply sentry plan', () => {
    const plan = sentryPlanMonth
    const plans = [plan]
    const accountDetails = {
      activatedUserCount: 5,
      subscriptionDetail: { cancelAtPeriodEnd: false },
    }

    it('renders correct image', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const image = await screen.findByRole('img', {
        name: 'sentry codecov logos',
      })
      expect(image).toBeInTheDocument()
    })

    it('renders marketing name', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const marketingName = await screen.findByRole('heading', {
        name: /Sentry Pro Team/,
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('renders 29 monthly bundle', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const price = await screen.findByRole('heading', { name: /\$29/i })
      expect(price).toBeInTheDocument()
    })

    it('renders pricing disclaimer', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const disclaimer = await screen.findByText(
        /\$12 per user \/ month if paid monthly/i
      )
      expect(disclaimer).toBeInTheDocument()
    })

    it('renders benefits section', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const benefitOne = await screen.findByText('Includes 5 seats')
      expect(benefitOne).toBeInTheDocument()

      const benefitTwo = await screen.findByText(
        'Unlimited public repositories'
      )
      expect(benefitTwo).toBeInTheDocument()

      const benefitThree = await screen.findByText(
        'Unlimited private repositories'
      )
      expect(benefitThree).toBeInTheDocument()

      const benefitFour = await screen.findByText('Priority Support')
      expect(benefitFour).toBeInTheDocument()
    })

    it('renders cancellation link', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const link = await screen.findByRole('link', { name: /Cancel/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })
  })

  describe('user can not apply sentry plan', () => {
    const plan = proPlanMonth
    const plans = [plan]
    const accountDetails = {
      activatedUserCount: 5,
      subscriptionDetail: { cancelAtPeriodEnd: false },
    }

    it('renders marketing name', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const marketingName = await screen.findByRole('heading', {
        name: /Pro Team plan/,
      })
      expect(marketingName).toBeInTheDocument()
    })

    it('renders price', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const price = await screen.findByText(/\$10/)
      expect(price).toBeInTheDocument()
    })

    it('renders pricing disclaimer', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const disclaimer = await screen.findByText(
        /billed annually or \$12 for monthly billing/i
      )
      expect(disclaimer).toBeInTheDocument()
    })

    it('renders benefits section', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const benefitOne = await screen.findByText('Configurable # of users')
      expect(benefitOne).toBeInTheDocument()

      const benefitTwo = await screen.findByText(
        'Unlimited public repositories'
      )
      expect(benefitTwo).toBeInTheDocument()

      const benefitThree = await screen.findByText(
        'Unlimited private repositories'
      )
      expect(benefitThree).toBeInTheDocument()

      const benefitFour = await screen.findByText('Priority Support')
      expect(benefitFour).toBeInTheDocument()
    })

    it('renders cancellation link', async () => {
      setup()

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
        />,
        { wrapper: wrapper() }
      )

      const link = await screen.findByRole('link', { name: /Cancel/ })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/plan/gh/codecov/cancel')
    })
  })

  describe('not rendering cancellation link', () => {
    describe('user is currently on a free plan', () => {
      it('does not render cancel link', async () => {
        setup()

        const plan = freePlan
        const plans = [plan]
        const accountDetails = {
          activatedUserCount: 5,
          subscriptionDetail: { cancelAtPeriodEnd: false },
        }

        render(
          <UpgradeDetails
            accountDetails={accountDetails}
            plan={plan}
            plans={plans}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
          />,
          { wrapper: wrapper() }
        )

        const loading = await screen.findByText('Loading...')
        expect(loading).toBeInTheDocument()

        await waitForElementToBeRemoved(loading)

        const link = screen.queryByRole('link', { name: /Cancel plan/ })
        expect(link).not.toBeInTheDocument()
      })
    })

    describe('user is on a trial', () => {
      it('does not render cancel link', async () => {
        setup({ isOngoingTrial: true })

        const plan = trialPlan
        const plans = [plan]
        const accountDetails = {
          activatedUserCount: 5,
          subscriptionDetail: { cancelAtPeriodEnd: false },
        }

        render(
          <UpgradeDetails
            accountDetails={accountDetails}
            plan={plan}
            plans={plans}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
          />,
          { wrapper: wrapper() }
        )

        const loading = await screen.findByText('Loading...')
        expect(loading).toBeInTheDocument()

        await waitForElementToBeRemoved(loading)

        const link = screen.queryByRole('link', { name: /Cancel plan/ })
        expect(link).not.toBeInTheDocument()
      })
    })

    describe('user has already cancelled plan', () => {
      it('does not render cancel link', async () => {
        setup()

        const plan = proPlanMonth
        const plans = [plan]

        const accountDetails = {
          activatedUserCount: 5,
          subscriptionDetail: { cancelAtPeriodEnd: true },
        }

        render(
          <UpgradeDetails
            accountDetails={accountDetails}
            plan={plan}
            plans={plans}
            proPlanMonth={proPlanMonth}
            proPlanYear={proPlanYear}
            sentryPlanMonth={sentryPlanMonth}
            sentryPlanYear={sentryPlanYear}
          />,
          { wrapper: wrapper() }
        )

        const loading = await screen.findByText('Loading...')
        expect(loading).toBeInTheDocument()

        await waitForElementToBeRemoved(loading)

        const link = screen.queryByRole('link', { name: /Cancel plan/ })
        expect(link).not.toBeInTheDocument()
      })
    })
  })

  describe('when scheduled phase is valid', () => {
    it('renders scheduled phase', async () => {
      setup()

      const plan = proPlanMonth
      const plans = [plan]
      const accountDetails = {
        activatedUserCount: 5,
        subscriptionDetail: {
          cancelAtPeriodEnd: false,
          scheduledPhase: {
            phase: 'pro',
            effectiveDate: '2021-01-01T00:00:00Z',
            startDate: 123456789,
          },
        },
      }

      render(
        <UpgradeDetails
          accountDetails={accountDetails}
          plan={plan}
          plans={plans}
          proPlanMonth={proPlanMonth}
          proPlanYear={proPlanYear}
          sentryPlanMonth={sentryPlanMonth}
          sentryPlanYear={sentryPlanYear}
          scheduledPhase={accountDetails.subscriptionDetail.scheduledPhase}
        />,
        { wrapper: wrapper() }
      )

      const scheduledPhase = await screen.findByText('Scheduled Details')
      expect(scheduledPhase).toBeInTheDocument()
    })
  })
})
