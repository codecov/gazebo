import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { IndividualPlan, TrialStatuses } from 'services/account'
import { accountDetailsParsedObj } from 'services/account/mocks'
import { BillingRate, Plans } from 'shared/utils/billing'

import UpgradeForm from './UpgradeForm'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('services/toastNotification', async () => {
  const actual = await vi.importActual('services/toastNotification')
  return {
    ...actual,
    useAddNotification: mocks.useAddNotification,
  }
})

vi.mock('@stripe/react-stripe-js')
vi.mock('@sentry/react')

const basicPlan = {
  marketingName: 'Basic',
  value: Plans.USERS_BASIC,
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 1 user',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  monthlyUploadLimit: 250,
}

const proPlanMonth = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  quantity: 10,
  monthlyUploadLimit: null,
}

const proPlanYear = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPY,
  billingRate: BillingRate.ANNUALLY,
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  quantity: 13,
}

const sentryPlanMonth = {
  marketingName: 'Sentry Pro Team',
  value: Plans.USERS_SENTRYM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
  quantity: 10,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro Team',
  value: Plans.USERS_SENTRYY,
  billingRate: BillingRate.ANNUALLY,
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
  quantity: 21,
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
}

const teamPlanYear = {
  baseUnitPrice: 4,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
}

const trialPlan = {
  marketingName: 'Pro Trial Team',
  value: Plans.USERS_TRIAL,
  billingRate: null,
  baseUnitPrice: 12,
  benefits: ['Configurable # of users', 'Unlimited repos'],
  monthlyUploadLimit: null,
}

const mockAccountDetailsBasic = {
  ...accountDetailsParsedObj,
  plan: basicPlan,
  activatedUserCount: 1,
  inactiveUserCount: 0,
}

const mockAccountDetailsProMonthly = {
  ...accountDetailsParsedObj,
  plan: proPlanMonth,
  activatedUserCount: 7,
  inactiveUserCount: 0,
  subscriptionDetail: {
    latestInvoice: {
      periodStart: 1595270468,
      periodEnd: 1597948868,
      dueDate: '1600544863',
      amountPaid: 9600.0,
      amountDue: 9600.0,
      amountRemaining: 0.0,
      total: 9600.0,
      subtotal: 9600.0,
      invoicePdf:
        'https://pay.stripe.com/invoice/acct_14SJTOGlVGuVgOrk/invst_Hs2qfFwArnp6AMjWPlwtyqqszoBzO3q/pdf',
    },
  },
}

const mockAccountDetailsProYearly = {
  ...accountDetailsParsedObj,
  plan: proPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockAccountDetailsTrial = {
  ...accountDetailsParsedObj,
  plan: trialPlan,
  activatedUserCount: 28,
  inactiveUserCount: 0,
}

const mockAccountDetailsTeamYearly = {
  ...accountDetailsParsedObj,
  plan: teamPlanYear,
  activatedUserCount: 5,
  inactiveUserCount: 0,
}

const mockAccountDetailsTeamMonthly = {
  ...accountDetailsParsedObj,
  plan: teamPlanMonth,
  activatedUserCount: 5,
  inactiveUserCount: 0,
}

const mockAccountDetailsSentryYearly = {
  ...accountDetailsParsedObj,
  plan: sentryPlanYear,
  activatedUserCount: 7,
  inactiveUserCount: 0,
}

const mockPlanDataResponse = {
  baseUnitPrice: 10,
  benefits: [],
  marketingName: 'Pro Team',
  monthlyUploadLimit: 250,
  value: Plans.USERS_PR_INAPPM,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 10,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
})
const server = setupServer()

beforeAll(() => {
  server.listen()
})

afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
  vi.clearAllMocks()
})

afterAll(() => {
  server.close()
})

let testLocation: ReturnType<typeof useLocation>

const wrapper: (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren> =
  (initialEntries = ['/gh/codecov']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner">
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

type SetupArgs = {
  planValue?: (typeof Plans)[keyof typeof Plans]
  successfulPatchRequest?: boolean
  errorDetails?: string
  trialStatus?: keyof typeof TrialStatuses
  hasTeamPlans?: boolean
  hasSentryPlans?: boolean
  monthlyPlan?: boolean
  planUserCount?: number
}

describe('UpgradeForm', () => {
  function setup({
    planValue = Plans.USERS_BASIC,
    successfulPatchRequest = true,
    errorDetails = undefined,
    trialStatus = TrialStatuses.NOT_STARTED,
    hasTeamPlans = false,
    hasSentryPlans = false,
    monthlyPlan = true,
    planUserCount = 1,
  }: SetupArgs) {
    const addNotification = vi.fn()
    const user = userEvent.setup()
    const patchRequest = vi.fn()
    mocks.useAddNotification.mockReturnValue(addNotification)

    server.use(
      http.get(`/internal/:provider/:owner/account-details/`, () => {
        if (planValue === Plans.USERS_BASIC) {
          return HttpResponse.json(mockAccountDetailsBasic)
        } else if (planValue === Plans.USERS_PR_INAPPM) {
          return HttpResponse.json(mockAccountDetailsProMonthly)
        } else if (planValue === Plans.USERS_PR_INAPPY) {
          return HttpResponse.json(mockAccountDetailsProYearly)
        } else if (planValue === Plans.USERS_TRIAL) {
          return HttpResponse.json(mockAccountDetailsTrial)
        } else if (planValue === Plans.USERS_TEAMY) {
          return HttpResponse.json(mockAccountDetailsTeamYearly)
        } else if (planValue === Plans.USERS_TEAMM) {
          return HttpResponse.json(mockAccountDetailsTeamMonthly)
        } else if (planValue === Plans.USERS_SENTRYY) {
          return HttpResponse.json(mockAccountDetailsSentryYearly)
        }
      }),
      http.patch(
        `/internal/:provider/:owner/account-details/`,
        async (info) => {
          if (!successfulPatchRequest) {
            if (errorDetails) {
              return HttpResponse.json(
                { detail: errorDetails },
                { status: 500 }
              )
            }
            return HttpResponse.json({ success: false }, { status: 500 })
          }
          const body = await info.request.json()

          patchRequest(body)

          return HttpResponse.json({ success: true })
        }
      ),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: {
            owner: {
              availablePlans: [
                basicPlan,
                proPlanMonth,
                proPlanYear,
                trialPlan,
                ...(hasTeamPlans ? [teamPlanMonth, teamPlanYear] : []),
                ...(hasSentryPlans ? [sentryPlanMonth, sentryPlanYear] : []),
              ],
            },
          },
        })
      }),
      graphql.query('GetPlanData', () => {
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...mockPlanDataResponse,
                trialStatus,
                billingRate:
                  planValue === Plans.USERS_BASIC
                    ? null
                    : monthlyPlan
                      ? BillingRate.MONTHLY
                      : BillingRate.ANNUALLY,
                isFreePlan: planValue === Plans.USERS_BASIC,
                isEnterprisePlan: false,
                isProPlan:
                  planValue === Plans.USERS_PR_INAPPM ||
                  planValue === Plans.USERS_PR_INAPPY ||
                  planValue === Plans.USERS_SENTRYM ||
                  planValue === Plans.USERS_SENTRYY,
                isTeamPlan:
                  planValue === Plans.USERS_TEAMM ||
                  planValue === Plans.USERS_TEAMY,
                isTrialPlan: planValue === Plans.USERS_TRIAL,
                value: planValue,
                planUserCount,
              },
            },
          },
        })
      })
    )

    return { addNotification, user, patchRequest }
  }

  describe('when rendered', () => {
    describe('when the user has a basic plan', () => {
      const props = {
        setSelectedPlan: vi.fn(),
        selectedPlan: proPlanYear,
      }
      it('renders the organization and owner titles', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_BASIC, monthlyPlan: false })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$240/)
        expect(price).toBeInTheDocument()
      })

      it('renders minimum seat number of 2', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const minimumSeat = await screen.findByRole('spinbutton')
        expect(minimumSeat).toHaveValue(2)
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_BASIC })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const proceedToCheckoutButton = await screen.findByRole('button', {
          name: /Proceed to checkout/,
        })
        expect(proceedToCheckoutButton).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the proceed to checkout for the update button', async () => {
        setup({ planValue: Plans.USERS_BASIC })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const proceedToCheckoutButton = await screen.findByRole('button', {
          name: /Proceed to checkout/,
        })
        expect(proceedToCheckoutButton).toBeInTheDocument()
      })

      describe('when the user has team plans available', () => {
        it('renders the Pro button as "selected"', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            hasTeamPlans: true,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const optionBtn = await screen.findByRole('button', { name: 'Pro' })
          expect(optionBtn).toBeInTheDocument()
          expect(optionBtn).toHaveClass('bg-ds-primary-base')
        })

        it('renders team option button', async () => {
          setup({
            planValue: Plans.USERS_BASIC,
            hasTeamPlans: true,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const optionBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(optionBtn).toBeInTheDocument()
        })

        describe('when updating to a team plan', () => {
          it('renders up to 10 seats text', async () => {
            const { user } = setup({
              planValue: Plans.USERS_BASIC,
              hasTeamPlans: true,
            })
            render(<UpgradeForm {...props} />, { wrapper: wrapper() })

            const teamOption = await screen.findByRole('button', {
              name: 'Team',
            })
            await user.click(teamOption)

            const auxiliaryText = await screen.findByText(/Up to 10 users/)
            expect(auxiliaryText).toBeInTheDocument()
          })

          it('calls setSelectedPlan with yearly team plan when selecting team button', async () => {
            const { user } = setup({
              planValue: Plans.USERS_BASIC,
              hasTeamPlans: true,
            })
            render(<UpgradeForm {...props} />, { wrapper: wrapper() })

            const teamOption = await screen.findByRole('button', {
              name: 'Team',
            })
            await user.click(teamOption)
            expect(props.setSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          })
        })
      })

      describe('when updating to a month plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({ planValue: Plans.USERS_BASIC })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const monthOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthOption)

          const price = screen.getByText(/\$48/)
          expect(price).toBeInTheDocument()
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with yearly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: proPlanYear.value,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const optionBtn = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(optionBtn)

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPM,
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_BASIC,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_BASIC,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Insufficient funds.',
            })
          )
        })

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            planValue: Plans.USERS_BASIC,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const proceedToCheckoutButton = await screen.findByRole('button', {
            name: /Proceed to checkout/,
          })
          await user.click(proceedToCheckoutButton)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Something went wrong',
            })
          )
        })
      })
    })

    describe('when the user has a pro plan monthly', () => {
      const props = {
        setSelectedPlan: vi.fn(),
        selectedPlan: proPlanYear,
      }
      it('renders the organization and owner titles', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders monthly option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 10 seats (existing subscription)', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM, planUserCount: 10 })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(10)
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM, planUserCount: 10 })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$120/)
        expect(price).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than number of active users', async () => {
        const { user } = setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '6')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPM })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when updating to a yearly plan', () => {
        it('has the price for the year', async () => {
          const { user } = setup({
            planValue: Plans.USERS_PR_INAPPM,
            planUserCount: 10,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const annualOption = await screen.findByRole('button', {
            name: 'Annual',
          })
          await user.click(annualOption)

          const price = screen.getByText(/\$100/)
          expect(price).toBeInTheDocument()
        })
      })

      describe('when the user has team plans available', () => {
        it('renders the Pro button as "selected"', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPM,
            hasTeamPlans: true,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const optionBtn = await screen.findByRole('button', { name: 'Pro' })
          expect(optionBtn).toBeInTheDocument()
          expect(optionBtn).toHaveClass('bg-ds-primary-base')
        })

        it('renders team option button', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPM,
            hasTeamPlans: true,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const optionBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(optionBtn).toBeInTheDocument()
        })

        describe('when updating to a team plan', () => {
          it('renders up to 10 seats text', async () => {
            const { user } = setup({
              planValue: Plans.USERS_PR_INAPPM,
              hasTeamPlans: true,
            })
            render(<UpgradeForm {...props} />, { wrapper: wrapper() })

            const teamOption = await screen.findByRole('button', {
              name: 'Team',
            })
            await user.click(teamOption)

            const auxiliaryText = await screen.findByText(/Up to 10 users/)
            expect(auxiliaryText).toBeInTheDocument()
          })

          it('calls setSelectedPlan with yearly team plan when selecting team button', async () => {
            const { user } = setup({
              planValue: Plans.USERS_BASIC,
              hasTeamPlans: true,
            })
            render(<UpgradeForm {...props} />, { wrapper: wrapper() })

            const teamOption = await screen.findByRole('button', {
              name: 'Team',
            })
            await user.click(teamOption)
            expect(props.setSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          })
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPM,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPM,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with yearly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPM,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const optionBtn = await screen.findByRole('button', {
            name: 'Annual',
          })
          await user.click(optionBtn)

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPY,
              },
            })
          )
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_PR_INAPPM,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Insufficient funds.',
            })
          )
        })

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            planValue: Plans.USERS_PR_INAPPM,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Something went wrong',
            })
          )
        })
      })
    })

    describe('when the user has a pro plan yearly', () => {
      const props = {
        setSelectedPlan: vi.fn(),
        selectedPlan: proPlanYear,
      }
      it('renders the organization and owner titles', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY, monthlyPlan: false })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY, monthlyPlan: false })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY, monthlyPlan: false })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY, monthlyPlan: false })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 13 seats (existing subscription)', async () => {
        setup({
          planValue: Plans.USERS_PR_INAPPY,
          monthlyPlan: false,
          planUserCount: 13,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(13)
      })

      it('has the price for the year', async () => {
        setup({
          planValue: Plans.USERS_PR_INAPPY,
          monthlyPlan: false,
          planUserCount: 13,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$130/)
        expect(price).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({
          planValue: Plans.USERS_PR_INAPPY,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than number of active users', async () => {
        const { user } = setup({
          planValue: Plans.USERS_PR_INAPPY,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '9')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({ planValue: Plans.USERS_PR_INAPPY, monthlyPlan: false })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when updating to a monthly plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({
            planValue: Plans.USERS_PR_INAPPY,
            monthlyPlan: false,
            planUserCount: 13,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const monthlyOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthlyOption)

          const price = screen.getByText(/\$156/)
          expect(price).toBeInTheDocument()
        })
      })

      describe('when the user has team plans available', () => {
        it('renders the Pro button as "selected"', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            hasTeamPlans: true,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const optionBtn = await screen.findByRole('button', { name: 'Pro' })
          expect(optionBtn).toBeInTheDocument()
          expect(optionBtn).toHaveClass('bg-ds-primary-base')
        })

        it('renders team option button', async () => {
          setup({
            planValue: Plans.USERS_PR_INAPPY,
            hasTeamPlans: true,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const optionBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(optionBtn).toBeInTheDocument()
        })

        describe('when updating to a team plan', () => {
          it('renders up to 10 seats text', async () => {
            const { user } = setup({
              planValue: Plans.USERS_PR_INAPPY,
              hasTeamPlans: true,
              monthlyPlan: false,
            })
            render(<UpgradeForm {...props} />, { wrapper: wrapper() })

            const teamOption = await screen.findByRole('button', {
              name: 'Team',
            })
            await user.click(teamOption)

            const auxiliaryText = await screen.findByText(/Up to 10 users/)
            expect(auxiliaryText).toBeInTheDocument()
          })

          it('calls setSelectedPlan with yearly team plan when selecting team button', async () => {
            const { user } = setup({
              planValue: Plans.USERS_BASIC,
              hasTeamPlans: true,
            })
            render(<UpgradeForm {...props} />, { wrapper: wrapper() })

            const teamOption = await screen.findByRole('button', {
              name: 'Team',
            })
            await user.click(teamOption)
            expect(props.setSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          })
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with an annual plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPY,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with a monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const optionBtn = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(optionBtn)

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 20,
                value: Plans.USERS_PR_INAPPM,
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            planValue: Plans.USERS_PR_INAPPY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_PR_INAPPY,
            monthlyPlan: false,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Insufficient funds.',
            })
          )
        })

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            planValue: Plans.USERS_PR_INAPPY,
            monthlyPlan: false,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '20')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Something went wrong',
            })
          )
        })
      })
    })

    describe('when the user has a sentry plan yearly', () => {
      const props = {
        setSelectedPlan: vi.fn(),
        selectedPlan: sentryPlanYear,
      }
      it('renders the organization and owner titles', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders the price for the included 5 seats', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasTeamPlans: false,
          hasSentryPlans: true,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const planTitle = await screen.findByText(/Plan/)
        expect(planTitle).toBeInTheDocument()
        const planDescription = await screen.findByText(
          /\$29 monthly includes 5 seats./
        )
        expect(planDescription).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 21 seats (existing subscription)', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          monthlyPlan: false,
          planUserCount: 21,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(21)
      })

      it('has the price for the year', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          monthlyPlan: false,
          planUserCount: 21,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$189/)
        expect(price).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 5 seats', async () => {
        const { user } = setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '3')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 5 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than number of active users', async () => {
        const { user } = setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '6')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when updating to a monthly plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({
            planValue: Plans.USERS_SENTRYY,
            hasSentryPlans: true,
            monthlyPlan: false,
            planUserCount: 21,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const monthlyOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthlyOption)

          const price = screen.getByText(/\$221/)
          expect(price).toBeInTheDocument()
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with an annual plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            hasSentryPlans: true,
            planValue: Plans.USERS_SENTRYY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '8')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 8,
                value: Plans.USERS_SENTRYY,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with a monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            hasSentryPlans: true,
            planValue: Plans.USERS_SENTRYY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const optionBtn = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(optionBtn)

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 7,
                value: Plans.USERS_SENTRYM,
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            hasSentryPlans: true,
            planValue: Plans.USERS_SENTRYY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            hasSentryPlans: true,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_SENTRYY,
            monthlyPlan: false,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Insufficient funds.',
            })
          )
        })

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            hasSentryPlans: true,
            planValue: Plans.USERS_SENTRYY,
            monthlyPlan: false,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Something went wrong',
            })
          )
        })
      })
    })

    describe('when the user has a team plan yearly', () => {
      const props = {
        setSelectedPlan: vi.fn(),
        selectedPlan: teamPlanYear,
      }
      it('renders the organization and owner titles', async () => {
        setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const organizationTitle = await screen.findByText(/Organization/)
        expect(organizationTitle).toBeInTheDocument()
        const ownerTitle = await screen.findByText(/codecov/)
        expect(ownerTitle).toBeInTheDocument()
      })

      it('renders up to 10 seats text', async () => {
        const { user } = setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const teamOption = await screen.findByRole('button', {
          name: 'Team',
        })
        await user.click(teamOption)

        const auxiliaryText = await screen.findByText(/Up to 10 users/)
        expect(auxiliaryText).toBeInTheDocument()
      })

      it('renders monthly option button', async () => {
        setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders the seat input with 5 seats (existing subscription)', async () => {
        setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const seatCount = await screen.findByRole('spinbutton')
        expect(seatCount).toHaveValue(2)
      })

      it('has the price for the year', async () => {
        setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$8/)
        expect(price).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than 2 seats', async () => {
        const { user } = setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
          monthlyPlan: false,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '1')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /You cannot purchase a per user plan for less than 2 users/
        )
        expect(error).toBeInTheDocument()
      })

      it('renders validation error when the user selects more than 10 seats', async () => {
        const { user } = setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '14')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /Team plan is only available for 10 seats or fewer./
        )
        expect(error).toBeInTheDocument()
      })

      it('renders validation error when the user selects less than number of active users', async () => {
        const { user } = setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const input = await screen.findByRole('spinbutton')
        await user.type(input, '{backspace}{backspace}{backspace}')
        await user.type(input, '3')

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeDisabled()

        const error = screen.getByText(
          /deactivate more users before downgrading plans/i
        )
        expect(error).toBeInTheDocument()
      })

      it('renders the update button', async () => {
        setup({
          planValue: Plans.USERS_TEAMY,
          hasTeamPlans: true,
        })
        render(<UpgradeForm {...props} />, { wrapper: wrapper() })

        const update = await screen.findByRole('button', {
          name: /Update/,
        })
        expect(update).toBeInTheDocument()
      })

      describe('when updating to a monthly plan', () => {
        it('has the price for the month', async () => {
          const { user } = setup({
            planValue: Plans.USERS_TEAMY,
            hasTeamPlans: true,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const monthlyOption = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(monthlyOption)

          const price = screen.getByText(/\$10/)
          expect(price).toBeInTheDocument()
        })
      })

      describe('when the mutation is successful', () => {
        it('renders success notification when upgrading seats with an annual plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            hasTeamPlans: true,
            planValue: Plans.USERS_TEAMY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '8')

          const teamOption = await screen.findByRole('button', {
            name: 'Team',
          })
          await user.click(teamOption)

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 8,
                value: Plans.USERS_TEAMY,
              },
            })
          )
        })

        it('renders success notification when upgrading seats with a monthly plan', async () => {
          const { patchRequest, user } = setup({
            successfulPatchRequest: true,
            hasTeamPlans: true,
            planValue: Plans.USERS_TEAMY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const optionBtn = await screen.findByRole('button', {
            name: 'Monthly',
          })
          await user.click(optionBtn)

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() =>
            expect(patchRequest).toHaveBeenCalledWith({
              plan: {
                quantity: 7,
                value: Plans.USERS_TEAMM,
              },
            })
          )
        })

        it('redirects the user to the plan page', async () => {
          const { user } = setup({
            successfulPatchRequest: true,
            hasTeamPlans: true,
            planValue: Plans.USERS_TEAMY,
            monthlyPlan: false,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isFetching())

          expect(testLocation.pathname).toEqual('/plan/gh/codecov')
        })
      })

      describe('when the mutation is unsuccessful', () => {
        it('adds an error notification with detail message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            hasTeamPlans: true,
            errorDetails: 'Insufficient funds.',
            planValue: Plans.USERS_TEAMY,
            monthlyPlan: false,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Insufficient funds.',
            })
          )
        })

        it('adds an error notification with a default message', async () => {
          const { addNotification, user } = setup({
            successfulPatchRequest: false,
            hasTeamPlans: true,
            planValue: Plans.USERS_TEAMY,
            monthlyPlan: false,
          })

          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '7')

          const update = await screen.findByRole('button', {
            name: /Update/,
          })
          await user.click(update)

          await waitFor(() => queryClient.isMutating())
          await waitFor(() => queryClient.isFetching())
          await waitFor(() => !queryClient.isMutating())
          await waitFor(() => !queryClient.isFetching())

          await waitFor(() =>
            expect(addNotification).toHaveBeenCalledWith({
              type: 'error',
              text: 'Something went wrong',
            })
          )
        })
      })
    })

    describe('user is currently on a trial', () => {
      const props = {
        setSelectedPlan: vi.fn(),
        selectedPlan: {
          value: Plans.USERS_PR_INAPPY,
        } as IndividualPlan,
      }
      describe('user chooses less than the number of active users', () => {
        it('does not display an error', async () => {
          const { user } = setup({
            planValue: Plans.USERS_TRIAL,
            trialStatus: TrialStatuses.ONGOING,
          })
          render(<UpgradeForm {...props} />, { wrapper: wrapper() })

          const input = await screen.findByRole('spinbutton')
          await user.type(input, '{backspace}{backspace}{backspace}')
          await user.type(input, '8')

          const updateButton = await screen.findByRole('button', {
            name: 'Update',
          })
          await user.click(updateButton)

          await waitFor(() => queryClient.isMutating)
          await waitFor(() => !queryClient.isMutating)

          const error = screen.queryByText(
            /deactivate more users before downgrading plans/i
          )
          expect(error).not.toBeInTheDocument()
        })
      })
    })
  })
})
