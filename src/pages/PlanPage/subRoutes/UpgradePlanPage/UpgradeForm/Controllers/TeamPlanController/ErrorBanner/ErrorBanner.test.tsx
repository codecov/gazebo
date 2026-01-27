import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account/usePlanData'
import { BillingRate, Plans } from 'shared/utils/billing'
import { UPGRADE_FORM_TOO_MANY_SEATS_MESSAGE } from 'shared/utils/upgradeForm'

import ErrorBanner from './ErrorBanner'

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
  hasSeatsLeft: true,
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
  hasSeatsLeft: true,
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
  hasSeatsLeft: true,
  isTeamPlan: true,
  isSentryPlan: false,
}

const proPlanMonth = {
  value: Plans.USERS_PR_INAPPM,
  baseUnitPrice: 12,
  benefits: ['asdf'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Pro',
  monthlyUploadLimit: null,
  hasSeatsLeft: true,
  isTeamPlan: false,
  isSentryPlan: false,
}

const proPlanYear = {
  value: Plans.USERS_PR_INAPPY,
  baseUnitPrice: 10,
  benefits: ['asdf'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Pro',
  monthlyUploadLimit: null,
  hasSeatsLeft: true,
  isTeamPlan: false,
  isSentryPlan: false,
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
    { planValue = Plans.USERS_DEVELOPER }: SetupArgs = {
      planValue: Plans.USERS_DEVELOPER,
    }
  ) {
    const user = userEvent.setup()

    server.use(
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
                proPlanMonth,
                proPlanYear,
              ],
            },
          },
        })
      }),
      graphql.query('GetPlanData', () => {
        const planChunk = {
          trialStatus: TrialStatuses.NOT_STARTED,
          trialStartDate: '',
          trialEndDate: '',
          trialTotalDays: 0,
          pretrialUsersCount: 0,
          planUserCount: 1,
          freeSeatCount: 0,
          isEnterprisePlan: false,
          isFreePlan: false,
          isProPlan: false,
          isSentryPlan: false,
          isTeamPlan: false,
          isTrialPlan: false,
        }
        if (planValue === Plans.USERS_DEVELOPER) {
          return HttpResponse.json({
            data: {
              owner: {
                hasPrivateRepos: true,
                plan: { ...basicPlan, ...planChunk },
              },
            },
          })
        } else if (planValue === Plans.USERS_TEAMM) {
          return HttpResponse.json({
            data: {
              owner: {
                hasPrivateRepos: true,
                plan: { ...teamPlanMonth, ...planChunk },
              },
            },
          })
        } else if (planValue === Plans.USERS_TEAMY) {
          return HttpResponse.json({
            data: {
              owner: {
                hasPrivateRepos: true,
                plan: { ...teamPlanYear, ...planChunk },
              },
            },
          })
        }
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
        it('updates selected plan to monthly when current plan is monthly', async () => {
          const { user } = setup({ planValue: Plans.USERS_TEAMM })
          render(<ErrorBanner {...props} />, { wrapper: wrapper() })

          const button = await screen.findByRole('button', {
            name: 'Upgrade to Pro',
          })
          expect(button).toBeInTheDocument()

          await user.click(button)

          expect(props.setSelectedPlan).toHaveBeenCalledWith(
            expect.objectContaining({ value: Plans.USERS_PR_INAPPM })
          )
          expect(props.setFormValue).toHaveBeenCalledWith(
            'newPlan',
            { ...proPlanMonth, hasSeatsLeft: undefined },
            { shouldValidate: true }
          )
        })

        it('updates selected plan to yearly when current plan is yearly', async () => {
          const { user } = setup({ planValue: Plans.USERS_TEAMY })
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
            { ...proPlanYear, hasSeatsLeft: undefined },
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
