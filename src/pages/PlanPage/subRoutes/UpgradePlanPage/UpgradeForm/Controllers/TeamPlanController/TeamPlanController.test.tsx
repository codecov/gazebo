import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account/usePlanData'
import { BillingRate, Plans } from 'shared/utils/billing'
import { UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE } from 'shared/utils/upgradeForm'

import TeamPlanController from './TeamPlanController'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('services/toastNotification/context', async () => {
  const actual = await vi.importActual('services/toastNotification/context')
  return {
    ...actual,
    useAddNotification: mocks.useAddNotification,
  }
})

vi.mock('@stripe/react-stripe-js')

const basicPlan = {
  marketingName: 'Basic',
  value: Plans.USERS_DEVELOPER,
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 1 user',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  monthlyUploadLimit: 250,
  isTeamPlan: false,
  isSentryPlan: false,
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 paid users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
  quantity: 10,
  isTeamPlan: true,
  isSentryPlan: false,
}

const teamPlanYear = {
  baseUnitPrice: 4,
  benefits: ['Up to 10 paid users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
  isTeamPlan: true,
  isSentryPlan: false,
}

const proPlanYear = {
  value: Plans.USERS_PR_INAPPY,
  baseUnitPrice: 10,
  benefits: ['asdf'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Pro',
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: false,
}

const proPlanMonth = {
  value: Plans.USERS_PR_INAPPM,
  baseUnitPrice: 12,
  benefits: ['asdf'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Pro',
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: false,
}

const mockAccountDetailsBasic = {
  plan: basicPlan,
  activatedUserCount: 1,
  inactiveUserCount: 0,
}

const mockAccountDetailsTeamMonthly = {
  plan: teamPlanMonth,
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

const mockAccountDetailsTeamYearly = {
  plan: teamPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockPlanDataResponseMonthly = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Pro Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_PR_INAPPM,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  freeSeatCount: 0,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isFreePlan: false,
  isProPlan: false,
  isSentryPlan: false,
  isTeamPlan: false,
  isTrialPlan: false,
}

const mockPlanDataResponseYearly = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Pro Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_PR_INAPPY,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  freeSeatCount: 0,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isFreePlan: false,
  isProPlan: false,
  isSentryPlan: false,
  isTeamPlan: false,
  isTrialPlan: false,
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
      retry: false,
    },
  },
  logger: {
    error: () => null,
    warn: () => null,
    log: () => null,
  },
})
const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => {
  queryClient.clear()
  server.resetHandlers()
})
afterAll(() => server.close())

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>
const wrapper: WrapperClosure =
  (initialEntries = ['/gh/codecov']) =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        <Route path="/:provider/:owner">
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

interface SetupArgs {
  planValue: string
  errorDetails?: string
  monthlyPlan?: boolean
}

describe('TeamPlanController', () => {
  function setup(
    { planValue = Plans.USERS_DEVELOPER, monthlyPlan = true }: SetupArgs = {
      planValue: Plans.USERS_DEVELOPER,
      monthlyPlan: true,
    }
  ) {
    const addNotification = vi.fn()
    const user = userEvent.setup()
    mocks.useAddNotification.mockReturnValue(addNotification)

    server.use(
      http.get(`/internal/gh/codecov/account-details/`, () => {
        if (planValue === Plans.USERS_DEVELOPER) {
          return HttpResponse.json(mockAccountDetailsBasic)
        } else if (planValue === Plans.USERS_TEAMM) {
          return HttpResponse.json(mockAccountDetailsTeamMonthly)
        } else if (planValue === Plans.USERS_TEAMY) {
          return HttpResponse.json(mockAccountDetailsTeamYearly)
        }
      }),
      http.patch('/internal/gh/codecov/account-details/', async () => {
        return HttpResponse.json({ success: false })
      }),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: {
            owner: {
              availablePlans: [
                basicPlan,
                teamPlanMonth,
                teamPlanYear,
                proPlanYear,
                proPlanMonth,
              ],
            },
          },
        })
      }),
      graphql.query('GetPlanData', () => {
        const planResponse = monthlyPlan
          ? mockPlanDataResponseMonthly
          : mockPlanDataResponseYearly
        return HttpResponse.json({
          data: { owner: { hasPrivateRepos: true, plan: planResponse } },
        })
      })
    )

    return { addNotification, user }
  }

  describe('when rendered', () => {
    describe('when the user has a team plan monthly', () => {
      const props = {
        setFormValue: vi.fn(),
        setSelectedPlan: vi.fn(),
        register: vi.fn(),
        newPlan: teamPlanMonth,
        seats: 10,
        errors: { seats: { message: '' } },
      }
      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByTestId('radio-monthly')
        expect(optionBtn).toBeInTheDocument()
      })

      it('does not renders annual option button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = screen.queryByTestId('radio-annual')
        expect(optionBtn).not.toBeInTheDocument()
      })

      it('renders monthly option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByTestId('radio-monthly')
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toBeChecked()
      })

      it('has the monthly price for', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$50/)
        expect(price).toBeInTheDocument()
      })

      it('does not have the price for the year', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const price = screen.queryByText(/\$120/)
        expect(price).not.toBeInTheDocument()
      })

      it('does not have the switch to annual button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const switchToAnnualLink = screen.queryByText('switch to annual')
        expect(switchToAnnualLink).not.toBeInTheDocument()
      })
    })

    describe('when seats are greater than 10', () => {
      const setFormValue = vi.fn()
      const setSelectedPlan = vi.fn()
      const props = {
        setFormValue,
        setSelectedPlan,
        register: vi.fn(),
        newPlan: teamPlanMonth,
        seats: 12,
        errors: {
          seats: {
            message: UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE,
          },
        },
      }

      it('shows error message', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const error = await screen.findByText(
          `💡 ${UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE}`
        )
        expect(error).toBeInTheDocument()
      })

      it('shows Upgrade to Pro button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const button = await screen.findByRole('button', {
          name: 'Upgrade to Pro',
        })
        expect(button).toBeInTheDocument()
      })

      describe('and user clicks Upgrade to Pro button', () => {
        it('updates selected plan', async () => {
          const { user } = setup({ planValue: Plans.USERS_TEAMM })
          render(<TeamPlanController {...props} />, { wrapper: wrapper() })

          const button = await screen.findByRole('button', {
            name: 'Upgrade to Pro',
          })
          expect(button).toBeInTheDocument()

          await user.click(button)

          expect(setSelectedPlan).toHaveBeenCalledWith(
            expect.objectContaining({ value: Plans.USERS_PR_INAPPM })
          )
          expect(setFormValue).toHaveBeenCalledWith('newPlan', proPlanMonth, {
            shouldValidate: true,
          })
        })
      })
    })

    describe('when the user has a team plan yearly', () => {
      const props = {
        setFormValue: vi.fn(),
        setSelectedPlan: vi.fn(),
        register: vi.fn(),
        newPlan: teamPlanYear,
        seats: 5,
        errors: { seats: { message: '' } },
      }

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_TEAMY })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByTestId('radio-monthly')
        expect(optionBtn).toBeInTheDocument()
      })

      it('does not render annual option button', async () => {
        setup({ planValue: Plans.USERS_TEAMY, monthlyPlan: false })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = screen.queryByTestId('radio-annual')
        expect(optionBtn).not.toBeInTheDocument()
      })

      it('does not have the price for the year', async () => {
        setup({ planValue: Plans.USERS_TEAMY, monthlyPlan: false })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const price = screen.queryByText(/\$60/)
        expect(price).not.toBeInTheDocument()
      })
    })
  })
})
