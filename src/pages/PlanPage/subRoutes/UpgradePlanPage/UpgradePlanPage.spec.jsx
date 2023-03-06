import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import UpgradePlanPage from './UpgradePlanPage'

jest.mock('./UpgradePlanForm', () => () => 'UpgradePlanForm')

const plans = [
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
  },
  {
    marketingName: 'Pro Team',
    value: 'users-enterprisem',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
  },
  {
    marketingName: 'Pro Team',
    value: 'users-enterprisey',
    billingRate: 'annually',
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
  },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})
const server = setupServer()

let testLocation
const wrapper =
  (initialWrappers = '/plan/gh/codecov/upgrade') =>
  ({ children }) =>
    (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialWrappers]}>
          <Route path="/plan/:provider/:owner/upgrade">
            <Suspense fallback={null}>{children}</Suspense>
          </Route>
          <Route
            path="*"
            render={({ location }) => {
              testLocation = location
              return null
            }}
          />
        </MemoryRouter>
      </QueryClientProvider>
    )

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => {
  server.close()
})

describe('UpgradePlanPage', () => {
  function setup(
    { planValue = Plans.USERS_INAPPY, periodEnd = undefined } = {
      planValue: Plans.USERS_INAPPY,
      periodEnd: undefined,
    }
  ) {
    server.use(
      rest.get('/internal/plans', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(plans))
      ),
      rest.get('/internal/gh/codecov/account-details', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.json({
            plan: {
              value: planValue,
              benefits: [
                'Configureable # of users',
                'Unlimited public repositories',
                'Unlimited private repositories',
                'Priorty Support',
              ],
            },
            subscriptionDetail: {
              cancelAtPeriodEnd: periodEnd,
            },
          })
        )
      )
    )
  }

  describe('when rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the basic plan title', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Pro Team/)
      expect(title).toBeInTheDocument()
    })

    it('renders a cancel plan link', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const cancelLink = await screen.findByText('Cancel plan')
      expect(cancelLink).toBeInTheDocument()
    })

    it('does not render upgrade banner', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const banner = screen.queryByText(/You are choosing to upgrade/)
      expect(banner).not.toBeInTheDocument()
    })
  })

  describe('when rendered with free plan', () => {
    beforeEach(() => {
      setup({ planValue: Plans.USERS_FREE })
    })

    it('renders upgrade banner', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const banner = await screen.findByText(/You are choosing to upgrade/)
      expect(banner).toBeInTheDocument()
    })
  })

  describe('when rendered with an enterprise plan', () => {
    beforeEach(() => {
      setup({ planValue: Plans.USERS_ENTERPRISEM })
    })

    it('redirects user to plan page', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      await waitFor(() =>
        expect(testLocation.pathname).toBe('/plan/gh/codecov')
      )
    })
  })

  describe('when account has already cancelled plan', () => {
    beforeEach(() => {
      setup({ planValue: Plans.USERS_INAPPY, periodEnd: true })
    })

    it('does not render cancel plan link', async () => {
      render(<UpgradePlanPage />, { wrapper: wrapper() })

      const title = await screen.findByText(/Pro Team/)
      expect(title).toBeInTheDocument()

      const cancelLink = screen.queryByText('Cancel plan')
      expect(cancelLink).not.toBeInTheDocument()
    })
  })
})
