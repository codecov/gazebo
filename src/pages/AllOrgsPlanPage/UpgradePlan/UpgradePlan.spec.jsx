import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import UpgradePlan from './UpgradePlan'

jest.mock('@stripe/react-stripe-js')

const accountOne = {
  integrationId: null,
  activatedStudentCount: 0,
  activatedUserCount: 0,
  checkoutSessionId: null,
  email: 'codecov-user@codecov.io',
  inactiveUserCount: 0,
  name: 'codecov-user',
  nbActivePrivateRepos: 1,
  planAutoActivate: true,
  planProvider: null,
  repoTotalCredits: 99999999,
  rootOrganization: null,
  scheduleDetail: null,
  studentCount: 0,
  subscriptionDetail: null,
}

const freePlan = {
  marketingName: 'Free',
  value: 'users-free',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  quantity: 5,
}

const basicPlan = {
  marketingName: 'Basic',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  monthlyUploadRates: 250,
  benefits: [
    'Up to 5 users',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
}

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

const enterprisePlan = {
  marketingName: 'Enterprise Cloud',
  value: 'users-enterprisey',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
  logger: {
    error: () => {},
  },
})
const server = setupServer()

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh']}>
      <Route path="/plan/:provider">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

describe('UpgradePlan', () => {
  function setup(
    {
      isFreePlan = false,
      isCancelledPlan = false,
      isEnterprisePlan = false,
    } = {
      isFreePlan: false,
      isCancelledPlan: false,
      isEnterprisePlan: false,
    }
  ) {
    server.use(
      graphql.query('MyContexts', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            me: {
              owner: {
                username: 'cool-user',
                avatarUrl: '',
              },
              myOrganizations: {
                edges: [
                  { node: { username: 'org1', avatarUrl: '' } },
                  { node: { username: 'org2', avatarUrl: '' } },
                ],
                pageInfo: {
                  hasNextPage: false,
                  endCursor: 'second',
                },
              },
            },
          })
        )
      ),
      rest.get('/internal/plans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json([freePlan, basicPlan, proPlanMonth, proPlanYear])
        )
      }),
      rest.get('/internal/gh/org1/account-details/', (req, res, ctx) => {
        if (isFreePlan) {
          return res(
            ctx.status(200),
            ctx.json({
              ...accountOne,
              plan: freePlan,
            })
          )
        }

        if (isEnterprisePlan) {
          return res(
            ctx.status(200),
            ctx.json({
              ...accountOne,
              plan: enterprisePlan,
            })
          )
        }

        if (isCancelledPlan) {
          return res(
            ctx.status(200),
            ctx.json({
              ...accountOne,
              plan: proPlanMonth,
              subscriptionDetail: {
                cancelAtPeriodEnd: true,
              },
            })
          )
        }

        return res(
          ctx.status(200),
          ctx.json({
            ...accountOne,
            plan: proPlanMonth,
          })
        )
      })
    )
  }

  describe('no org selected', () => {
    beforeEach(() => setup())

    describe('renders plan card', () => {
      it('has plan name', async () => {
        render(<UpgradePlan />, { wrapper })

        const planName = await screen.findByRole('heading', {
          name: 'Pro Team',
        })
        expect(planName).toBeInTheDocument()
      })

      it('has plan price', async () => {
        render(<UpgradePlan />, { wrapper })

        const price = await screen.findByText('$10*')
        expect(price).toBeInTheDocument()
      })

      it('has list of benefits', async () => {
        render(<UpgradePlan />, { wrapper })

        const configurableUsers = await screen.findByText(
          'Configurable # of users'
        )
        expect(configurableUsers).toBeInTheDocument()

        const unlimitedPubRepos = await screen.findByText(
          'Unlimited public repositories'
        )
        expect(unlimitedPubRepos).toBeInTheDocument()

        const unlimitedPrivRepos = await screen.findByText(
          'Unlimited private repositories'
        )
        expect(unlimitedPrivRepos).toBeInTheDocument()

        const prioritySupport = await screen.findByText('Priority Support')
        expect(prioritySupport).toBeInTheDocument()
      })

      it('has note about monthly payments', async () => {
        render(<UpgradePlan />, { wrapper })

        const note = await screen.findByText(
          '*$12 per user / month if paid monthly'
        )
        expect(note).toBeInTheDocument()
      })

      it('does not render cancel plan link', async () => {
        render(<UpgradePlan />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const cancelLink = screen.queryByRole('link', { name: /Cancel plan/i })
        expect(cancelLink).not.toBeInTheDocument()
      })
    })

    describe('renders form card', () => {
      it('renders select', async () => {
        render(<UpgradePlan />, { wrapper })

        const orgHeader = await screen.findByRole('heading', {
          name: 'Organization',
        })
        expect(orgHeader).toBeInTheDocument()

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        expect(select).toBeInTheDocument()
      })

      it('renders billing', async () => {
        render(<UpgradePlan />, { wrapper })

        const billing = await screen.findByRole('heading', { name: 'Billing' })
        expect(billing).toBeInTheDocument()
      })

      it('renders user seats', async () => {
        render(<UpgradePlan />, { wrapper })

        const userSeats = await screen.findByRole('spinbutton')
        expect(userSeats).toBeInTheDocument()
      })

      it('renders update button', async () => {
        render(<UpgradePlan />, { wrapper })

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })
    })
  })

  describe('user selects an org on a pro plan', () => {
    beforeEach(() => setup())

    describe('renders plan card', () => {
      it('has plan name', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const planName = await screen.findByRole('heading', {
          name: 'Pro Team',
        })
        expect(planName).toBeInTheDocument()
      })

      it('has plan price', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const price = await screen.findByText('$10*')
        expect(price).toBeInTheDocument()
      })

      it('has list of benefits', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const configurableUsers = await screen.findByText(
          'Configurable # of users'
        )
        expect(configurableUsers).toBeInTheDocument()

        const unlimitedPubRepos = await screen.findByText(
          'Unlimited public repositories'
        )
        expect(unlimitedPubRepos).toBeInTheDocument()

        const unlimitedPrivRepos = await screen.findByText(
          'Unlimited private repositories'
        )
        expect(unlimitedPrivRepos).toBeInTheDocument()

        const prioritySupport = await screen.findByText('Priority Support')
        expect(prioritySupport).toBeInTheDocument()
      })

      it('has note about monthly payments', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const note = await screen.findByText(
          '*$12 per user / month if paid monthly'
        )
        expect(note).toBeInTheDocument()
      })

      it('renders cancel plan link', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const cancelLink = await screen.findByRole('link', {
          name: /Cancel plan/i,
        })
        expect(cancelLink).toBeInTheDocument()
      })
    })

    describe('renders form card', () => {
      it('renders select', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const orgHeader = await screen.findByRole('heading', {
          name: 'Organization',
        })
        expect(orgHeader).toBeInTheDocument()

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        expect(select).toBeInTheDocument()

        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const selectOrgOne = await screen.findByText('org1')
        expect(selectOrgOne).toBeInTheDocument()
      })

      it('renders billing', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const billing = await screen.findByRole('heading', { name: 'Billing' })
        expect(billing).toBeInTheDocument()
      })

      it('renders user seats', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const userSeats = await screen.findByRole('spinbutton')
        expect(userSeats).toBeInTheDocument()
      })

      it('renders update button', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        const update = await screen.findByText(/Update/)
        expect(update).toBeDisabled()
      })
    })
  })

  describe('user has a free plan', () => {
    beforeEach(() => setup({ isFreePlan: true }))

    it('does not render cancel plan link', async () => {
      const user = userEvent.setup()
      render(<UpgradePlan />, { wrapper })

      const select = await screen.findByRole('button', {
        name: /Select organization/i,
      })
      await user.click(select)

      const org1 = await screen.findByText('org1')
      await user.click(org1)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const cancelLink = screen.queryByRole('link', { name: /Cancel plan/i })
      await waitFor(() => expect(cancelLink).not.toBeInTheDocument())
    })
  })

  describe('user has an enterprise plan', () => {
    beforeEach(() => setup({ isEnterprisePlan: true }))

    describe('renders plan card', () => {
      it('has plan name', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const planName = await screen.findByRole('heading', {
          name: 'Enterprise Cloud',
        })
        expect(planName).toBeInTheDocument()
      })

      it('has plan price', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const price = await screen.findByText('Custom Pricing')
        expect(price).toBeInTheDocument()
      })

      it('has list of benefits', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const configurableUsers = await screen.findByText(
          'Configurable # of users'
        )
        expect(configurableUsers).toBeInTheDocument()

        const unlimitedPubRepos = await screen.findByText(
          'Unlimited public repositories'
        )
        expect(unlimitedPubRepos).toBeInTheDocument()

        const unlimitedPrivRepos = await screen.findByText(
          'Unlimited private repositories'
        )
        expect(unlimitedPrivRepos).toBeInTheDocument()

        const prioritySupport = await screen.findByText('Priority Support')
        expect(prioritySupport).toBeInTheDocument()
      })

      it('does not have a note about monthly payments', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const note = screen.queryByText('*$12 per user / month if paid monthly')
        expect(note).toBeInTheDocument()
      })

      it('does not render cancel plan link', async () => {
        render(<UpgradePlan />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const cancelLink = screen.queryByRole('link', { name: /Cancel plan/i })
        expect(cancelLink).not.toBeInTheDocument()
      })
    })

    describe('renders form card', () => {
      it('renders select', async () => {
        render(<UpgradePlan />, { wrapper })

        const orgHeader = await screen.findByRole('heading', {
          name: 'Organization',
        })
        expect(orgHeader).toBeInTheDocument()

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        expect(select).toBeInTheDocument()
      })

      it('renders enterprise message', async () => {
        const user = userEvent.setup()
        render(<UpgradePlan />, { wrapper })

        const select = await screen.findByRole('button', {
          name: /Select organization/i,
        })
        await user.click(select)

        const org1 = await screen.findByText('org1')
        await user.click(org1)

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const message = await screen.findByText(
          /This organization is on an enterprise plan, to change or cancel your plan please contact/
        )
        expect(message).toBeInTheDocument()

        const salesLink = await screen.findByRole('link', {
          name: /sales@codecov.io/,
        })
        expect(salesLink).toBeInTheDocument()
      })
    })
  })

  describe('user has already cancelled their plan', () => {
    const user = userEvent.setup()
    beforeEach(() => setup({ isCancelledPlan: true }))

    it('does not render cancel plan link', async () => {
      render(<UpgradePlan />, { wrapper })

      const select = await screen.findByRole('button', {
        name: /Select organization/i,
      })
      await user.click(select)

      const org1 = await screen.findByText('org1')
      await user.click(org1)

      await waitFor(() => queryClient.isFetching)
      await waitFor(() => !queryClient.isFetching)

      const cancelLink = screen.queryByRole('link', { name: /Cancel plan/i })
      await waitFor(() => expect(cancelLink).not.toBeInTheDocument())
    })
  })
})
