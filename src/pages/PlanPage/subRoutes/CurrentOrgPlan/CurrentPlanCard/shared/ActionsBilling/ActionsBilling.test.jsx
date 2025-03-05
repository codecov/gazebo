import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account/usePlanData'
import { BillingRate, Plans } from 'shared/utils/billing'

import ActionsBilling from './ActionsBilling'

const mocks = vi.hoisted(() => ({
  useRedirect: vi.fn(),
}))

vi.mock('shared/useRedirect', async () => {
  const actual = await vi.importActual('shared/useRedirect')
  return {
    ...actual,
    useRedirect: mocks.useRedirect,
  }
})

const allPlans = [
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
    isTeamPlan: false,
    isSentryPlan: false,
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
      'Priorty Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
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
      'Priorty Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_ENTERPRISEM,
    billingRate: BillingRate.MONTHLY,
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priorty Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
  {
    marketingName: 'Pro Team',
    value: Plans.USERS_ENTERPRISEY,
    billingRate: BillingRate.ANNUALLY,
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priorty Support',
    ],
    monthlyUploadLimit: null,
    isTeamPlan: false,
    isSentryPlan: false,
  },
]

const sentryPlans = [
  {
    marketingName: 'Pro Team for Sentry',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    monthlyUploadLimit: null,
    value: Plans.USERS_SENTRYM,
    billingRate: BillingRate.MONTHLY,
    isTeamPlan: false,
    isSentryPlan: true,
  },
]

const mockedFreeAccountDetails = {
  plan: {
    marketingName: 'Pro Team',
    baseUnitPrice: 12,
    benefits: ['Configurable # of users', 'Unlimited repos'],
    quantity: 9,
    value: Plans.USERS_DEVELOPER,
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
    value: Plans.USERS_PR_INAPPM,
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
    value: Plans.USERS_SENTRYM,
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
    value: Plans.USERS_TRIAL,
  },
  activatedUserCount: 5,
  inactiveUserCount: 1,
}

const mockTrialData = {
  plan: {
    baseUnitPrice: 10,
    benefits: [],
    billingRate: BillingRate.MONTHLY,
    marketingName: 'Users Developer',
    monthlyUploadLimit: 250,
    value: Plans.USERS_DEVELOPER,
    trialStatus: 'ONGOING',
    trialStartDate: '2023-01-01T08:55:25',
    trialEndDate: '2023-01-10T08:55:25',
    trialTotalDays: 0,
    pretrialUsersCount: 0,
    planUserCount: 1,
    hasSeatsLeft: true,
    isEnterprisePlan: false,
    isFreePlan: true,
    isProPlan: false,
    isSentryPlan: false,
    isTeamPlan: false,
    isTrialPlan: false,
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
      hasPrivateRepos = true,
    } = {
      accountDetails: mockedFreeAccountDetails,
      plans: allPlans,
      trialPlanData: mockTrialData,
      hasPrivateRepos: true,
    }
  ) {
    const user = userEvent.setup()
    const mockMutationVars = vi.fn()
    const hardRedirect = vi.fn()
    mocks.useRedirect.mockImplementation((data) => ({
      hardRedirect: () => hardRedirect(data),
    }))

    server.use(
      http.get('/internal/gh/critical-role/account-details/', () => {
        return HttpResponse.json(accountDetails)
      }),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({ data: { owner: { availablePlans: plans } } })
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              plan: {
                ...trialPlanData.plan,
                value: accountDetails.plan.value,
                isFreePlan: accountDetails.plan.value === Plans.USERS_DEVELOPER,
                isTeamPlan:
                  accountDetails.plan.value === Plans.USERS_TEAMM ||
                  accountDetails.plan.value === Plans.USERS_TEAMY,
                isTrialPlan: accountDetails.plan.value === Plans.USERS_TRIAL,
                isSentryPlan: accountDetails.plan.value === Plans.USERS_SENTRYM,
              },
              hasPrivateRepos,
            },
          },
        })
      }),
      graphql.mutation('startTrial', (info) => {
        mockMutationVars(info.variables)
        return HttpResponse.json({ data: { startTrial: null } })
      })
    )

    return { mockMutationVars, user, hardRedirect }
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
          hasPrivateRepos: true,
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
          hasPrivateRepos: true,
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
            hasPrivateRepos: true,
          })

          render(<ActionsBilling />, { wrapper })

          const startTrialBtn = await screen.findByRole('button', {
            name: 'Start trial',
          })
          expect(startTrialBtn).toBeInTheDocument()

          await user.click(startTrialBtn)

          await waitFor(() => expect(mockMutationVars).toHaveBeenCalled())
          await waitFor(() =>
            expect(mockMutationVars).toHaveBeenCalledWith({
              input: { orgUsername: 'critical-role' },
            })
          )
        })
      })
    })

    describe('user does not have private repos', () => {
      it('does not renders start trial button', async () => {
        setup({
          accountDetails: mockedFreeAccountDetails,
          plans: allPlans,
          trialPlanData: {
            plan: {
              ...mockTrialData.plan,
              trialStatus: TrialStatuses.NOT_STARTED,
            },
          },
          hasPrivateRepos: false,
        })

        render(<ActionsBilling />, { wrapper })

        const startTrialButton = screen.queryByRole('button', {
          name: 'Start trial',
        })
        expect(startTrialButton).not.toBeInTheDocument()
      })

      it('renders upgrade to pro link', async () => {
        setup({
          accountDetails: mockedFreeAccountDetails,
          plans: allPlans,
          trialPlanData: {
            plan: {
              ...mockTrialData.plan,
              trialStatus: TrialStatuses.NOT_STARTED,
            },
          },
          hasPrivateRepos: false,
        })

        render(<ActionsBilling />, { wrapper })

        const upgradeToProLink = await screen.findByRole('link', {
          name: 'Upgrade',
        })
        expect(upgradeToProLink).toBeInTheDocument()
        expect(upgradeToProLink).toHaveAttribute(
          'href',
          '/plan/gh/critical-role/upgrade'
        )
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
          hasPrivateRepos: true,
        })

        render(<ActionsBilling />, { wrapper })

        const upgradeLink = await screen.findByRole('link', {
          name: /Upgrade/,
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
              hasPrivateRepos: true,
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
              hasPrivateRepos: true,
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
                hasPrivateRepos: true,
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

            await waitFor(() => expect(mockMutationVars).toHaveBeenCalled())
            await waitFor(() =>
              expect(mockMutationVars).toHaveBeenCalledWith({
                input: { orgUsername: 'critical-role' },
              })
            )
          })
        })

        it('redirects to the home page', async () => {
          const { user, hardRedirect } = setup({
            accountDetails: mockedFreeAccountDetails,
            plans: sentryPlans,
            trialPlanData: {
              hasPrivateRepos: true,
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
          await waitFor(() => expect(hardRedirect).toHaveBeenCalled())
        })
      })

      describe('user has a trial ongoing', () => {
        it('renders upgrade link', async () => {
          setup({
            accountDetails: mockTrialAccountDetails,
            plans: sentryPlans,
            trialPlanData: {
              hasPrivateRepos: true,
              plan: {
                ...mockTrialData.plan,
                trialStatus: TrialStatuses.ONGOING,
              },
            },
          })

          render(<ActionsBilling />, { wrapper })

          const upgradeLink = await screen.findByRole('link', {
            name: /Upgrade/,
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
