import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { IndividualPlan, TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import ProPlanController from './ProPlanController'

const mocks = vi.hoisted(() => ({
  useAddNotification: vi.fn(),
}))

vi.mock('@stripe/react-stripe-js')
vi.mock('services/toastNotification', async () => {
  const actual = await vi.importActual('services/toastNotification')
  return {
    ...actual,
    useAddNotification: mocks.useAddNotification,
  }
})

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
  isTeamPlan: false,
  isSentryPlan: false,
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
  isTeamPlan: false,
  isSentryPlan: false,
}

const trialPlan = {
  marketingName: 'Pro Trial Team',
  value: Plans.USERS_TRIAL,
  billingRate: null,
  baseUnitPrice: 12,
  benefits: ['Configurable # of users', 'Unlimited repos'],
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: false,
}

const mockAccountDetailsBasic = {
  plan: basicPlan,
  activatedUserCount: 1,
  inactiveUserCount: 0,
}

const mockAccountDetailsProMonthly = {
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
  plan: proPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockAccountDetailsTrial = {
  plan: trialPlan,
  activatedUserCount: 28,
  inactiveUserCount: 0,
}

const mockPlanDataResponseMonthly = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Pro Team',
  monthlyUploadLimit: 250,
  value: Plans.USERS_PR_INAPPM,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isProPlan: true,
  isFreePlan: false,
  isTeamPlan: false,
  isTrialPlan: false,
}

const mockPlanDataResponseYearly = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Pro Team',
  monthlyUploadLimit: 250,
  value: Plans.USERS_PR_INAPPY,
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
  isEnterprisePlan: false,
  isProPlan: true,
  isFreePlan: false,
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
  planValue: IndividualPlan
  errorDetails?: string
  monthlyPlan?: boolean
}

describe('ProPlanController', () => {
  function setup(
    { planValue = basicPlan, monthlyPlan = true }: SetupArgs = {
      planValue: basicPlan,
      monthlyPlan: true,
    }
  ) {
    const addNotification = vi.fn()
    const user = userEvent.setup()

    mocks.useAddNotification.mockReturnValue(addNotification)

    server.use(
      http.get(`/internal/gh/codecov/account-details/`, () => {
        if (planValue.value === Plans.USERS_BASIC) {
          return HttpResponse.json(mockAccountDetailsBasic)
        } else if (planValue.value === Plans.USERS_PR_INAPPM) {
          return HttpResponse.json(mockAccountDetailsProMonthly)
        } else if (planValue.value === Plans.USERS_PR_INAPPY) {
          return HttpResponse.json(mockAccountDetailsProYearly)
        } else if (planValue.value === Plans.USERS_TRIAL) {
          return HttpResponse.json(mockAccountDetailsTrial)
        }
      }),
      http.patch('/internal/gh/codecov/account-details/', async () => {
        return HttpResponse.json({ success: false })
      }),
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: {
            owner: {
              availablePlans: [basicPlan, proPlanMonth, proPlanYear, trialPlan],
            },
          },
        })
      }),
      graphql.query('GetPlanData', () => {
        const planResponse = monthlyPlan
          ? mockPlanDataResponseMonthly
          : mockPlanDataResponseYearly

        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: planResponse,
            },
          },
        })
      })
    )

    return { addNotification, user }
  }

  describe('when rendered', () => {
    describe('when the user has a pro plan monthly', () => {
      const props = {
        setFormValue: vi.fn(),
        register: vi.fn(),
        newPlan: proPlanMonth,
        seats: 10,
        errors: { seats: { message: '' } },
      }
      it('renders monthly option button', async () => {
        setup({ planValue: proPlanMonth })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: proPlanMonth })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders monthly option button as "selected"', async () => {
        setup({ planValue: proPlanMonth })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the price for the year', async () => {
        setup({ planValue: proPlanMonth })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$120/)
        expect(price).toBeInTheDocument()
      })
    })

    describe('when the user has a pro plan yearly', () => {
      const props = {
        setFormValue: vi.fn(),
        register: vi.fn(),
        newPlan: proPlanYear,
        seats: 13,
        errors: { seats: { message: '' } },
      }

      it('renders monthly option button', async () => {
        setup({ planValue: proPlanYear, monthlyPlan: false })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: proPlanYear, monthlyPlan: false })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({ planValue: proPlanYear, monthlyPlan: false })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the price for the year', async () => {
        setup({ planValue: proPlanYear, monthlyPlan: false })
        render(<ProPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$130/)
        expect(price).toBeInTheDocument()
      })
    })
  })
})
