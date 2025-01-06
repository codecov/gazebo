import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import SentryPlanController from './SentryPlanController'

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
  isTeamPlan: false,
  isSentryPlan: false,
}

const sentryPlanMonth = {
  marketingName: 'Sentry Pro',
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
  isTeamPlan: false,
  isSentryPlan: true,
}

const sentryPlanYear = {
  marketingName: 'Sentry Pro',
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
  isTeamPlan: false,
  isSentryPlan: true,
}

const mockAccountDetailsBasic = {
  plan: basicPlan,
  activatedUserCount: 1,
  inactiveUserCount: 0,
}

const mockAccountDetailsSentryMonthly = {
  plan: sentryPlanMonth,
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

const mockAccountDetailsSentryYearly = {
  plan: sentryPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockPlanDataResponseMonthly = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Pro',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_SENTRYM,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isFreePlan: false,
  isProPlan: true,
  isSentryPlan: true,
  isTeamPlan: false,
  isTrialPlan: false,
}

const mockPlanDataResponseYearly = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Pro',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_SENTRYY,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isFreePlan: false,
  isProPlan: true,
  isSentryPlan: true,
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

describe('SentryPlanController', () => {
  function setup(
    { planValue = Plans.USERS_BASIC, monthlyPlan = true }: SetupArgs = {
      planValue: Plans.USERS_BASIC,
      monthlyPlan: true,
    }
  ) {
    const addNotification = vi.fn()
    const user = userEvent.setup()
    mocks.useAddNotification.mockReturnValue(addNotification)

    server.use(
      http.get(`/internal/gh/codecov/account-details/`, () => {
        if (planValue === Plans.USERS_BASIC) {
          return HttpResponse.json(mockAccountDetailsBasic)
        } else if (planValue === Plans.USERS_SENTRYM) {
          return HttpResponse.json(mockAccountDetailsSentryMonthly)
        } else if (planValue === Plans.USERS_SENTRYY) {
          return HttpResponse.json(mockAccountDetailsSentryYearly)
        }
      }),
      http.patch('/internal/gh/codecov/account-details/', async () => {
        return HttpResponse.json({ success: false })
      }),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: {
            owner: {
              availablePlans: [basicPlan, sentryPlanMonth, sentryPlanYear],
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
    describe('when the user has a plan monthly', () => {
      const props = {
        setFormValue: vi.fn(),
        register: vi.fn(),
        newPlan: sentryPlanMonth,
        seats: 10,
        errors: { seats: { message: '' } },
      }
      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_SENTRYM })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_SENTRYM })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders monthly option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_SENTRYM })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the monthly price for', async () => {
        setup({ planValue: Plans.USERS_SENTRYM })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$89/)
        expect(price).toBeInTheDocument()
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_SENTRYM })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$120/)
        expect(price).toBeInTheDocument()
      })

      it('has the switch to annual button', async () => {
        setup({ planValue: Plans.USERS_SENTRYM })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const switchToAnnualLink = await screen.findByText('switch to annual')
        expect(switchToAnnualLink).toBeInTheDocument()
      })
    })

    describe('when the user has a plan yearly', () => {
      const props = {
        setFormValue: vi.fn(),
        register: vi.fn(),
        newPlan: sentryPlanYear,
        seats: 5,
        errors: { seats: { message: '' } },
      }

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_SENTRYY })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_SENTRYY })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_SENTRYY, monthlyPlan: false })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_SENTRYY })
        render(<SentryPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$29/)
        expect(price).toBeInTheDocument()
      })
    })
  })
})
