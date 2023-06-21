import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FreePlanCard from './FreePlanCard'

const allPlans = [
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
      'Priorty Support',
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
      'Priorty Support',
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
      'Priorty Support',
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
      'Priorty Support',
    ],
  },
]

const sentryPlans = [
  {
    marketingName: 'Sentry',
    value: 'users-sentrym',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: ['Up to # user', 'Unlimited public repositories'],
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentryy',
    billingRate: null,
    baseUnitPrice: 10,
    benefits: ['Up to # user', 'Unlimited private repositories'],
  },
]

const freePlan = {
  marketingName: 'Free',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: ['Up to 1 user', '250 free uploads'],
}

const sentryPlan = {
  marketingName: 'Sentry',
  value: 'users-sentrym',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: ['Up to # user', 'Unlimited public repositories'],
}

const scheduledPhase = {
  quantity: 0,
  plan: '',
  startDate: 123456789,
}

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const server = setupServer()

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
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('FreePlanCard', () => {
  function setup(
    { owner, plans } = {
      owner: {
        username: 'codecov',
        isCurrentUserPartOfOrg: true,
        numberOfUploads: 10,
      },
      plans: allPlans,
    }
  ) {
    server.use(
      graphql.query('PlanPageData', (req, res, ctx) =>
        res(ctx.status(200), ctx.data({ owner }))
      ),
      rest.get('/internal/plans', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(plans))
      ),
      rest.get('/internal/bb/critical-role/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ numberOfUploads: 250 }))
      )
    )
  }

  describe('When rendered', () => {
    beforeEach(() => {
      setup()
    })

    it('renders the plan marketing name', () => {
      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      expect(screen.getByText(/Free plan/)).toBeInTheDocument()
    })

    it('renders the benefits', () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(screen.getByText(/Up to 1 user/)).toBeInTheDocument()
    })

    it('renders the scheduled phase', () => {
      render(<FreePlanCard plan={freePlan} scheduledPhase={scheduledPhase} />, {
        wrapper,
      })

      expect(screen.getByText(/Scheduled Details/)).toBeInTheDocument()
    })

    it('renders actions billing button', () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(
        screen.getByRole('link', { name: /Manage plan/ })
      ).toBeInTheDocument()

      expect(screen.getByRole('link', { name: /Manage plan/ })).toHaveAttribute(
        'href',
        '/plan/bb/critical-role/upgrade'
      )
    })

    it('renders the help message', () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(
        screen.getByText(/to discuss custom Enterprise plans/)
      ).toBeInTheDocument()
    })

    it('renders number of uploads', async () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(
        await screen.findByText(/10 of 250 uploads in the last 30 days/)
      ).toBeInTheDocument()
    })

    it('renders the expected price details for pro team billing', async () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(await screen.findByText(/\$10/)).toBeInTheDocument()
      expect(await screen.findByText(/per user, per month/)).toBeInTheDocument()

      expect(
        await screen.findByText(
          /billed annually, or \$12 per user billing monthly/
        )
      ).toBeInTheDocument()
    })
  })

  describe('When can apply sentry updates', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: 10,
        },
        plans: sentryPlans,
      })
    })

    it('renders the benefits', () => {
      render(<FreePlanCard plan={sentryPlan} />, {
        wrapper,
      })

      expect(screen.getByText(/Up to # user/)).toBeInTheDocument()
    })

    it('renders actions billing button', async () => {
      render(<FreePlanCard plan={sentryPlan} />, {
        wrapper,
      })

      expect(
        await screen.findByRole('link', {
          name: /Upgrade to Sentry Pro Team plan/,
        })
      ).toBeInTheDocument()

      expect(
        await screen.findByRole('link', {
          name: /Upgrade to Sentry Pro Team plan/,
        })
      ).toHaveAttribute('href', '/plan/bb/critical-role/upgrade')
    })

    it('renders the expected price details for sentry pro team billing', async () => {
      render(<FreePlanCard plan={freePlan} />, {
        wrapper,
      })

      expect(await screen.findByText(/\$29/)).toBeInTheDocument()
      expect(await screen.findByText(/\/per month/)).toBeInTheDocument()

      expect(
        await screen.findByText(
          /over 5 users is \$10\/per user per month, billed annually/
        )
      ).toBeInTheDocument()
    })
  })
})
