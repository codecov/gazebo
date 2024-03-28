import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { useAddNotification } from 'services/toastNotification'
import { Plans } from 'shared/utils/billing'

import TeamPlanController from './TeamPlanController'

jest.mock('services/toastNotification')
jest.mock('@stripe/react-stripe-js')

const mockedToastNotification = useAddNotification as jest.Mock

const basicPlan = {
  marketingName: 'Basic',
  value: 'users-basic',
  billingRate: null,
  baseUnitPrice: 0,
  benefits: [
    'Up to 1 user',
    'Unlimited public repositories',
    'Unlimited private repositories',
  ],
  monthlyUploadLimit: 250,
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
  quantity: 10,
}

const teamPlanYear = {
  baseUnitPrice: 4,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
  quantity: 5,
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
  billingRate: 'monthly',
  marketingName: 'Pro Team',
  monthlyUploadLimit: 2500,
  value: 'test-plan',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
}

const mockPlanDataResponseYearly = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'yearly',
  marketingName: 'Pro Team',
  monthlyUploadLimit: 2500,
  value: 'test-plan',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
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
  ({ children }) =>
    (
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
    { planValue = Plans.USERS_BASIC, monthlyPlan = true }: SetupArgs = {
      planValue: Plans.USERS_BASIC,
      monthlyPlan: true,
    }
  ) {
    const addNotification = jest.fn()
    const user = userEvent.setup()
    mockedToastNotification.mockReturnValue(addNotification)

    server.use(
      rest.get(`/internal/gh/codecov/account-details/`, (req, res, ctx) => {
        if (planValue === Plans.USERS_BASIC) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsBasic))
        } else if (planValue === Plans.USERS_TEAMM) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsTeamMonthly))
        } else if (planValue === Plans.USERS_TEAMY) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsTeamYearly))
        }
      }),
      rest.patch(
        '/internal/gh/codecov/account-details/',
        async (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ success: false }))
        }
      ),
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans: [basicPlan, teamPlanMonth, teamPlanYear],
            },
          })
        )
      }),
      graphql.query('GetPlanData', (req, res, ctx) => {
        const planResponse = monthlyPlan
          ? mockPlanDataResponseMonthly
          : mockPlanDataResponseYearly
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              hasPrivateRepos: true,
              plan: planResponse,
            },
          })
        )
      })
    )

    return { addNotification, user }
  }

  describe('when rendered', () => {
    describe('when the user has a team plan monthly', () => {
      const props = {
        setFormValue: jest.fn(),
        register: jest.fn(),
        newPlan: Plans.USERS_TEAMM,
        seats: 10,
        errors: { seats: { message: '' } },
      }
      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders monthly option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the monthly price for', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$50/)
        expect(price).toBeInTheDocument()
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$120/)
        expect(price).toBeInTheDocument()
      })

      it('has the switch to annual button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const switchToAnnualLink = await screen.findByText('switch to annual')
        expect(switchToAnnualLink).toBeInTheDocument()
      })
    })

    describe('when seats are greater than 10', () => {
      const props = {
        setFormValue: jest.fn(),
        register: jest.fn(),
        newPlan: Plans.USERS_TEAMM,
        seats: 12,
        errors: {
          seats: {
            message: 'Team plan is only available for 10 or less users',
          },
        },
      }

      it('shows error message', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const error = await screen.findByText(
          'Team plan is only available for 10 or less users'
        )
        expect(error).toBeInTheDocument()
      })
    })

    describe('when the user has a team plan yearly', () => {
      const props = {
        setFormValue: jest.fn(),
        register: jest.fn(),
        newPlan: Plans.USERS_TEAMY,
        seats: 5,
        errors: { seats: { message: '' } },
      }

      it('renders monthly option button', async () => {
        setup({ planValue: Plans.USERS_TEAMY })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Monthly' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button', async () => {
        setup({ planValue: Plans.USERS_TEAMY, monthlyPlan: false })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
      })

      it('renders annual option button as "selected"', async () => {
        setup({ planValue: Plans.USERS_TEAMY, monthlyPlan: false })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const optionBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(optionBtn).toBeInTheDocument()
        expect(optionBtn).toHaveClass('bg-ds-primary-base')
      })

      it('has the price for the year', async () => {
        setup({ planValue: Plans.USERS_TEAMY, monthlyPlan: false })
        render(<TeamPlanController {...props} />, { wrapper: wrapper() })

        const price = await screen.findByText(/\$60/)
        expect(price).toBeInTheDocument()
      })
    })
  })
})
