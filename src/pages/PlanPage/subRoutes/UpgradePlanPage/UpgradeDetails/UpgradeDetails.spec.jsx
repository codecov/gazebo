import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import UpgradeDetails from './UpgradeDetails'

jest.mock('./SentryPlanDetails', () => () => 'Sentry Plan Details')
jest.mock('./ProPlanDetails', () => () => 'Pro Plan Details')

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
  quantity: 10,
  monthlyUploadLimit: null,
}

const sentryPlanMonth = {
  marketingName: 'Sentry Pro',
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
  monthlyUploadLimit: null,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro',
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

const allPlansWithoutSentry = [
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
    marketingName: 'Pro',
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
  proPlanYear,
  {
    marketingName: 'Pro',
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
    marketingName: 'Pro',
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
  function setup(
    { isSentryPlan = false } = {
      isSentryPlan: false,
    }
  ) {
    server.use(
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        if (isSentryPlan) {
          return res(
            ctx.status(200),
            ctx.data({
              owner: {
                availablePlans: [
                  ...allPlansWithoutSentry,
                  sentryPlanMonth,
                  sentryPlanYear,
                ],
              },
            })
          )
        } else {
          return res(
            ctx.status(200),
            ctx.data({ owner: { availablePlans: allPlansWithoutSentry } })
          )
        }
      }),
      rest.get('/internal/gh/codecov/account-details', (req, res, ctx) => {
        if (isSentryPlan) {
          return res(
            ctx.status(200),
            ctx.json({
              plan: sentryPlanYear,
            })
          )
        } else {
          return res(
            ctx.status(200),
            ctx.json({
              plan: proPlanYear,
            })
          )
        }
      })
    )
  }

  describe('when user can apply sentry plan', () => {
    it('renders sentry plan details component', async () => {
      setup({ isSentryPlan: true })
      render(<UpgradeDetails />, { wrapper: wrapper() })

      const sentryPlanDetails = await screen.findByText(/Sentry Plan Details/)
      expect(sentryPlanDetails).toBeInTheDocument()
    })
  })

  describe('user cannot apply sentry plan', () => {
    it('renders pro plan details component', async () => {
      setup({ isSentryPlan: false })
      render(<UpgradeDetails />, { wrapper: wrapper() })

      const proPlanDetails = await screen.findByText(/Pro Plan Details/)
      expect(proPlanDetails).toBeInTheDocument()
    })
  })
})
