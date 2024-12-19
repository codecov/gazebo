import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { IndividualPlan, TrialStatuses } from 'services/account'
import { BillingRate, Plans } from 'shared/utils/billing'

import UpdateButton from './UpdateButton'

const freePlan = {
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

const proPlanMonthly = {
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
  monthlyUploadLimit: null,
}

const proPlanYearly = {
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
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov/upgrade']}>
      <Route path="/:provider/:owner/upgrade">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  </QueryClientProvider>
)

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

const mockPlanBasic = {
  value: Plans.USERS_BASIC,
  baseUnitPrice: 4,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  hasSeatsLeft: true,
  planUserCount: 1,
  isFreePlan: true,
}

const mockPlanProMonthly = {
  value: Plans.USERS_PR_INAPPM,
  baseUnitPrice: 4,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  hasSeatsLeft: true,
  planUserCount: 4,
  isFreePlan: false,
}

const mockPlanTeamMonthly = {
  value: Plans.USERS_TEAMM,
  baseUnitPrice: 4,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  hasSeatsLeft: true,
  planUserCount: 3,
  isFreePlan: false,
}

interface SetupArgs {
  planValue: IndividualPlan
}

describe('UpdateButton', () => {
  function setup(
    { planValue = freePlan }: SetupArgs = {
      planValue: freePlan,
    }
  ) {
    server.use(
      graphql.query(`GetPlanData`, () => {
        const planChunk = {
          trialStatus: TrialStatuses.NOT_STARTED,
          trialStartDate: '',
          trialEndDate: '',
          trialTotalDays: 0,
          pretrialUsersCount: 0,
          isEnterprisePlan: false,
          isProPlan: false,
        }
        if (planValue.value === Plans.USERS_BASIC) {
          return HttpResponse.json({
            data: {
              owner: {
                hasPrivateRepos: false,
                plan: { ...mockPlanBasic, ...planChunk },
              },
            },
          })
        } else if (planValue.value === Plans.USERS_TEAMM) {
          return HttpResponse.json({
            data: {
              owner: {
                hasPrivateRepos: false,
                plan: {
                  ...mockPlanTeamMonthly,
                  ...planChunk,
                },
              },
            },
          })
        } else {
          return HttpResponse.json({
            data: {
              owner: {
                hasPrivateRepos: false,
                plan: { ...mockPlanProMonthly, ...planChunk },
              },
            },
          })
        }
      })
    )

    const mockSetFormValue = vi.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue }
  }

  describe('when rendered', () => {
    describe('when there is a valid basic plan', () => {
      it('renders a valid Proceed to checkout button', async () => {
        setup({ planValue: freePlan })

        const props = {
          isValid: true,
          newPlan: proPlanYearly,
          seats: 3,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Proceed to checkout')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      })
    })

    describe('when there is a valid pro plan', () => {
      it('renders a valid Update button', async () => {
        setup({ planValue: proPlanYearly })

        const props = {
          isValid: true,
          newPlan: proPlanYearly,
          seats: 27,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        expect(button).not.toBeDisabled()
      })
    })

    describe('when the button is invalid', () => {
      it('renders a disabled valid Update button', async () => {
        setup({ planValue: proPlanYearly })

        const props = {
          isValid: false,
          newPlan: proPlanYearly,
          seats: 6,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
      })
    })

    describe('when there are no changes in plan or seats', () => {
      it('renders a disabled valid Update button', async () => {
        setup({ planValue: proPlanMonthly })

        const props = {
          isValid: true,
          newPlan: proPlanMonthly,
          seats: 4,
        }

        render(<UpdateButton {...props} />, {
          wrapper,
        })

        const button = await screen.findByText('Update')
        expect(button).toBeInTheDocument()
        expect(button).toBeDisabled()
      })
    })
  })
})
