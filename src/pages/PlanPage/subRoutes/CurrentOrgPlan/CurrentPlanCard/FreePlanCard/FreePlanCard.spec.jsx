import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import FreePlanCard from './FreePlanCard'

const plans = [
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
    { owner } = {
      owner: {
        username: 'codecov',
        isCurrentUserPartOfOrg: true,
        numberOfUploads: 10,
      },
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
  })

  describe('When can apply sentry updates', () => {
    beforeEach(() => {
      setup({
        owner: {
          username: 'codecov',
          isCurrentUserPartOfOrg: false,
          numberOfUploads: 10,
        },
      })
    })

    it('renders the plan marketing name', () => {
      render(<FreePlanCard plan={sentryPlan} />, {
        wrapper,
      })

      expect(screen.getByText(/Sentry plan/)).toBeInTheDocument()
    })

    it('renders the benefits', () => {
      render(<FreePlanCard plan={sentryPlan} />, {
        wrapper,
      })

      expect(screen.getByText(/Up to # user/)).toBeInTheDocument()
    })

    it('renders actions billing button', () => {
      render(<FreePlanCard plan={sentryPlan} />, {
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
  })
})
