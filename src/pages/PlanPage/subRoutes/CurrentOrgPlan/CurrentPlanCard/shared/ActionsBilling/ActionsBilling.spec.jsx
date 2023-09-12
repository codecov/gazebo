import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'

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

const mockTrialAccountDetails = {
  plan: {
    marketingName: 'Trial plan',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: 'users-trial',
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const mockTrialData = {
  plan: {
    baseUnitPrice: 10,
    benefits: [],
    billingRate: 'monthly',
    marketingName: 'Users Basic',
    monthlyUploadLimit: 250,
    planName: 'users-basic',
    trialStatus: 'ONGOING',
    trialStartDate: '2023-01-01T08:55:25',
    trialEndDate: '2023-01-10T08:55:25',
    trialTotalDays: 0,
    pretrialUsersCount: 0,
  },
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

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

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/plan/gh/critical-role']}>
      <Route path="/plan/:provider/:owner">{children}</Route>
    </MemoryRouter>
  </QueryClientProvider>
)

describe('Actions Billing', () => {
  function setup(
    {
      accountDetails = mockedFreeAccountDetails,
      plans = allPlans,
      trialPlanData = mockTrialData,
    } = {
      accountDetails: mockedFreeAccountDetails,
      plans: allPlans,
      trialPlanData: mockTrialData,
    }
  ) {
    const user = userEvent.setup()
    const mockMutationVars = jest.fn()

    server.use(
      rest.get('/internal/gh/critical-role/account-details/', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(accountDetails))
      ),
      rest.get('/internal/plans', (req, res, ctx) =>
        res(ctx.status(200), ctx.json(plans))
      ),
      graphql.query('GetPlanData', (req, res, ctx) => {
        return res(ctx.status(200), ctx.data({ owner: trialPlanData }))
      }),
      graphql.mutation('startTrial', (req, res, ctx) => {
        mockMutationVars(req.variables)
        return res(ctx.status(200), ctx.data({ startTrial: null }))
      })
    )

    return { mockMutationVars, user }
  }

  describe('rendering component', () => {
    describe('user has a free plan', () => {
      it('renders start trial button', async () => {
        setup({
          accountDetails: mockedFreeAccountDetails,
          plans: allPlans,
          trialPlanData: {
            plan: {
              ...mockTrialData.plan,
              trialStatus: TrialStatuses.NOT_STARTED,
            },
          },
        })

        render(<ActionsBilling />, { wrapper })

        const startTrialButton = await screen.findByRole('button', {
          name: 'Start trial',
        })
        expect(startTrialButton).toBeInTheDocument()
      })

      it('renders upgrade now link', async () => {
        setup({
          accountDetails: mockedFreeAccountDetails,
          plans: allPlans,
          trialPlanData: {
            plan: {
              ...mockTrialData.plan,
              trialStatus: TrialStatuses.NOT_STARTED,
            },
          },
        })

        render(<ActionsBilling />, { wrapper })

        const upgradeNowLink = await screen.findByRole('link', {
          name: 'upgrade now',
        })
        expect(upgradeNowLink).toBeInTheDocument()
        expect(upgradeNowLink).toHaveAttribute(
          'href',
          '/plan/gh/critical-role/upgrade'
        )
      })

      describe('user clicks start trial', () => {
        it('triggers the mutation', async () => {
          const { mockMutationVars, user } = setup({
            accountDetails: mockedFreeAccountDetails,
            plans: allPlans,
            trialPlanData: {
              plan: {
                ...mockTrialData.plan,
                trialStatus: TrialStatuses.NOT_STARTED,
              },
            },
          })

          render(<ActionsBilling />, { wrapper })

          const startTrialBtn = await screen.findByRole('button', {
            name: 'Start trial',
          })
          expect(startTrialBtn).toBeInTheDocument()

          await user.click(startTrialBtn)

          await waitFor(() => expect(mockMutationVars).toBeCalled())
          await waitFor(() =>
            expect(mockMutationVars).toBeCalledWith({
              input: { orgUsername: 'critical-role' },
            })
          )
        })
      })
    })

    describe('user has a trial plan', () => {
      it('renders upgrade link', async () => {
        setup({
          accountDetails: mockTrialAccountDetails,
          plans: allPlans,
          trialPlanData: {
            plan: {
              ...mockTrialData.plan,
              trialStatus: TrialStatuses.ONGOING,
            },
          },
        })

        render(<ActionsBilling />, { wrapper })

        const upgradeLink = await screen.findByRole('link', {
          name: /Upgrade to Pro Team plan/,
        })
        expect(upgradeLink).toBeInTheDocument()
        expect(upgradeLink).toHaveAttribute(
          'href',
          '/plan/gh/critical-role/upgrade'
        )
      })
    })

    describe('user has a pro plan', () => {
      it('renders manage plan link', async () => {
        setup({
          accountDetails: mockedProAccountDetails,
        })

        render(<ActionsBilling />, { wrapper })

        const managePlanLink = await screen.findByRole('link', {
          name: /Manage plan/,
        })
        expect(managePlanLink).toBeInTheDocument()
        expect(managePlanLink).toHaveAttribute(
          'href',
          '/plan/gh/critical-role/upgrade'
        )
      })
    })

    describe('owner is a user', () => {
      it('renders view billing', async () => {
        setup({
          accountDetails: { rootOrganization: { username: 'critical-role' } },
        })

        render(<ActionsBilling />, { wrapper })

        const viewBillingLink = await screen.findByRole('link', {
          name: /View Billing/,
        })
        expect(viewBillingLink).toBeInTheDocument()
        expect(viewBillingLink).toHaveAttribute(
          'href',
          '/account/gh/critical-role/billing'
        )
      })

      it('renders the description', async () => {
        setup({
          accountDetails: { rootOrganization: { username: 'critical-role' } },
        })

        render(<ActionsBilling />, { wrapper })

        const description = await screen.findByText(
          /This subgroup's billing is managed by/
        )
        expect(description).toBeInTheDocument()
      })
    })

    describe('plan is managed by github', () => {
      it('renders the description', async () => {
        setup({
          accountDetails: { planProvider: 'github' },
        })

        render(<ActionsBilling />, { wrapper })

        const githubText = await screen.findByText(
          /Your account is configured via GitHub Marketplace/
        )
        expect(githubText).toBeInTheDocument()
      })

      it('renders manage billing in GitHub link', async () => {
        setup({ accountDetails: { planProvider: 'github' } })

        render(<ActionsBilling />, { wrapper })

        const githubLink = await screen.findByRole('link', {
          name: /Manage billing in GitHub/,
        })
        expect(githubLink).toBeInTheDocument()
        expect(githubLink).toHaveAttribute(
          'href',
          'https://github.com/marketplace/codecov'
        )
      })
    })

    describe('user can upgrade to sentry plan', () => {
      describe('user is on a free plan', () => {
        it('renders start trial button', async () => {
          setup({
            accountDetails: mockedFreeAccountDetails,
            plans: sentryPlans,
            trialPlanData: {
              plan: {
                ...mockTrialData.plan,
                trialStatus: TrialStatuses.NOT_STARTED,
              },
            },
          })

          render(<ActionsBilling />, { wrapper })

          const startTrialBtn = await screen.findByRole('button', {
            name: /Start trial/,
          })
          expect(startTrialBtn).toBeInTheDocument()
        })

        it('renders upgrade now link', async () => {
          setup({
            accountDetails: mockedFreeAccountDetails,
            plans: sentryPlans,
            trialPlanData: {
              plan: {
                ...mockTrialData.plan,
                trialStatus: TrialStatuses.NOT_STARTED,
              },
            },
          })

          render(<ActionsBilling />, { wrapper })

          const upgradeLink = await screen.findByRole('link', {
            name: /upgrade now/,
          })
          expect(upgradeLink).toBeInTheDocument()
          expect(upgradeLink).toHaveAttribute(
            'href',
            '/plan/gh/critical-role/upgrade'
          )
        })

        describe('user click start trial', () => {
          it('triggers the mutation', async () => {
            const { mockMutationVars, user } = setup({
              accountDetails: mockedFreeAccountDetails,
              plans: sentryPlans,
              trialPlanData: {
                plan: {
                  ...mockTrialData.plan,
                  trialStatus: TrialStatuses.NOT_STARTED,
                },
              },
            })

            render(<ActionsBilling />, { wrapper })

            const startTrialBtn = await screen.findByRole('button', {
              name: /Start trial/,
            })
            expect(startTrialBtn).toBeInTheDocument()

            await user.click(startTrialBtn)

            await waitFor(() => expect(mockMutationVars).toBeCalled())
            await waitFor(() =>
              expect(mockMutationVars).toBeCalledWith({
                input: { orgUsername: 'critical-role' },
              })
            )
          })
        })
      })

      describe('user has a trial ongoing', () => {
        it('renders upgrade link', async () => {
          setup({
            accountDetails: mockTrialAccountDetails,
            plans: sentryPlans,
            trialPlanData: {
              plan: {
                ...mockTrialData.plan,
                trialStatus: TrialStatuses.ONGOING,
              },
            },
          })

          render(<ActionsBilling />, { wrapper })

          const upgradeLink = await screen.findByRole('link', {
            name: /Upgrade to Sentry Pro Team plan/,
          })
          expect(upgradeLink).toBeInTheDocument()
          expect(upgradeLink).toHaveAttribute(
            'href',
            '/plan/gh/critical-role/upgrade'
          )
        })
      })
    })

    describe('user has a sentry plan', () => {
      it('renders manage plan', async () => {
        setup({
          accountDetails: sentryMockedAccountDetails,
          plans: sentryPlans,
        })

        render(<ActionsBilling />, { wrapper })

        await waitFor(() => queryClient.isFetching)
        await waitFor(() => !queryClient.isFetching)

        const manageLink = await screen.findByRole('link', {
          name: /Manage plan/,
        })
        expect(manageLink).toBeInTheDocument()
        expect(manageLink).toHaveAttribute(
          'href',
          '/plan/gh/critical-role/upgrade'
        )
      })
    })
  })
})
