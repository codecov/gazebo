import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'
import { UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE } from 'shared/utils/upgradeForm'

import ErrorBanner from './ErrorBanner'

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

const proPlanYear = {
  value: Plans.USERS_PR_INAPPY,
  baseUnitPrice: 10,
  benefits: ['asdf'],
  billingRate: 'annually',
  marketingName: 'Users Pro',
  monthlyUploadLimit: null,
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
  hasSeatsLeft: true,
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
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </Route>
      </MemoryRouter>
    </QueryClientProvider>
  )

interface SetupArgs {
  planValue: string
  monthlyPlan?: boolean
}

describe('ErrorBanner', () => {
  function setup(
    { planValue = Plans.USERS_BASIC, monthlyPlan = true }: SetupArgs = {
      planValue: Plans.USERS_BASIC,
      monthlyPlan: true,
    }
  ) {
    const user = userEvent.setup()

    server.use(
      http.get(`/internal/gh/codecov/account-details/`, (info) => {
        if (planValue === Plans.USERS_BASIC) {
          return HttpResponse.json(mockAccountDetailsBasic)
        } else if (planValue === Plans.USERS_TEAMM) {
          return HttpResponse.json(mockAccountDetailsTeamMonthly)
        } else if (planValue === Plans.USERS_TEAMY) {
          return HttpResponse.json(mockAccountDetailsTeamYearly)
        }
      }),
      http.patch('/internal/gh/codecov/account-details/', async (info) => {
        return HttpResponse.json({ success: false })
      }),
      graphql.query('GetAvailablePlans', (info) => {
        return HttpResponse.json({
          data: {
            owner: {
              availablePlans: [
                basicPlan,
                teamPlanMonth,
                teamPlanYear,
                proPlanYear,
              ],
            },
          },
        })
      }),
      graphql.query('GetPlanData', (info) => {
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

    return { user }
  }

  describe('when rendered', () => {
    describe('with too many seats error message', () => {
      const props = {
        errors: {
          seats: {
            message: UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE,
          },
        },
        setFormValue: vi.fn(),
        setSelectedPlan: vi.fn(),
      }

      it('shows appropriate error message', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<ErrorBanner {...props} />, { wrapper: wrapper() })

        const error = await screen.findByText(
          `💡 ${UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE}`
        )
        expect(error).toBeInTheDocument()
      })

      it('shows Upgrade to Pro button', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<ErrorBanner {...props} />, { wrapper: wrapper() })

        const button = await screen.findByRole('button', {
          name: 'Upgrade to Pro',
        })
        expect(button).toBeInTheDocument()
      })

      describe('and user clicks Upgrade to Pro button', () => {
        it('updates selected plan', async () => {
          const { user } = setup({ planValue: Plans.USERS_TEAMM })
          render(<ErrorBanner {...props} />, { wrapper: wrapper() })

          const button = await screen.findByRole('button', {
            name: 'Upgrade to Pro',
          })
          expect(button).toBeInTheDocument()

          await user.click(button)

          expect(props.setSelectedPlan).toHaveBeenCalledWith(
            expect.objectContaining({ value: Plans.USERS_PR_INAPPY })
          )
          expect(props.setFormValue).toHaveBeenCalledWith(
            'newPlan',
            Plans.USERS_PR_INAPPY,
            { shouldValidate: true }
          )
        })
      })
    })

    describe('with other error message', () => {
      const props = {
        errors: {
          seats: {
            message: 'error message asdf',
          },
        },
        setFormValue: vi.fn(),
        setSelectedPlan: vi.fn(),
      }

      it('shows error banner', async () => {
        setup({ planValue: Plans.USERS_TEAMM })
        render(<ErrorBanner {...props} />, { wrapper: wrapper() })

        const error = await screen.findByText(props.errors.seats.message)
        expect(error).toBeInTheDocument()
      })
    })
  })
})
