import { render, screen } from 'custom-testing-library'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import ActionsBilling from './ActionsBilling'

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
    marketingName: 'Pro Team for Sentry',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    value: 'users-sentrym',
    billingRate: 'monthly',
  },
]

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const mockedFreeAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: 'users-basic',
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const mockedProAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: 'users-basic',
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const sentryMockedAccountDetails = {
  plan: {
    marketingName: 'Pro Team for Sentry',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: 'users-sentrym',
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/members/gh/critical-role']}>
      <Route path="/:provider/:owner/:repo">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('Actions Billing', () => {
  function setup(accountDetails = mockedFreeAccountDetails, plans = allPlans) {
    server.use(
      rest.get('/internal/members/gh/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(accountDetails))
      ),
      rest.get('/internal/plans', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(plans))
      )
    )
  }

  describe('Renders Component', () => {
    beforeEach(() => setup())

    describe('For the free plan', () => {
      it('Displays upgrade pro team plan', async () => {
        render(<ActionsBilling />, { wrapper })

        expect(
          await screen.findByRole('link', { name: /Upgrade to Pro Team plan/ })
        ).toBeInTheDocument()

        expect(
          await screen.findByRole('link', { name: /Upgrade to Pro Team plan/ })
        ).toHaveAttribute('href', '/plan/members/gh/upgrade')
      })
    })
  })

  describe('For the pro plan', () => {
    beforeEach(() => setup(mockedProAccountDetails))

    it('Displays manage plan link', async () => {
      render(<ActionsBilling />, { wrapper })

      expect(
        await screen.findByRole('link', { name: /Manage plan/ })
      ).toBeInTheDocument()

      expect(
        await screen.findByRole('link', { name: /Manage plan/ })
      ).toHaveAttribute('href', '/plan/members/gh/upgrade')
    })
  })

  describe('If the root org has a username', () => {
    beforeEach(() => setup({ rootOrganization: { username: 'critical-role' } }))

    it('Displays view billing', async () => {
      render(<ActionsBilling />, { wrapper })

      expect(
        await screen.findByRole('link', { name: /View Billing/ })
      ).toBeInTheDocument()

      expect(
        await screen.findByRole('link', { name: /View Billing/ })
      ).toHaveAttribute('href', '/account/members/critical-role/billing')
    })

    it('Displays the description', async () => {
      render(<ActionsBilling />, { wrapper })

      expect(
        await screen.findByText(/This subgroup’s billing is managed by/)
      ).toBeInTheDocument()
    })
  })

  describe('If the plan is managed by github', () => {
    beforeEach(() => setup({ planProvider: 'github' }))

    it('Displays the description', async () => {
      render(<ActionsBilling />, { wrapper })

      expect(
        await screen.findByText(
          /Your account is configured via GitHub Marketplace/
        )
      ).toBeInTheDocument()
    })

    it('Displays manage billing in GitHub link', async () => {
      render(<ActionsBilling />, { wrapper })

      expect(
        await screen.findByRole('link', { name: /Manage billing in GitHub/ })
      ).toBeInTheDocument()

      expect(
        await screen.findByRole('link', { name: /Manage billing in GitHub/ })
      ).toHaveAttribute('href', 'https://github.com/marketplace/codecov')
    })
  })

  describe('If can upgrade to sentry plan', () => {
    beforeEach(() => setup(sentryMockedAccountDetails, sentryPlans))

    it('Displays upgrade to sentry plan', async () => {
      render(<ActionsBilling />, { wrapper })

      expect(
        await screen.findByRole('link', {
          name: /Upgrade to Sentry Pro Team plan/,
        })
      ).toBeInTheDocument()

      expect(
        await screen.findByRole('link', {
          name: /Upgrade to Sentry Pro Team plan/,
        })
      ).toHaveAttribute('href', '/plan/members/gh/upgrade')
    })
  })
})
