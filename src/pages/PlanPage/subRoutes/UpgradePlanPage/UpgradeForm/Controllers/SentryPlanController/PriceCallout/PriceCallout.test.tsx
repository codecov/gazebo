import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { BillingRate, Plans } from 'shared/utils/billing'

import PriceCallout from './PriceCallout'

const freePlan = {
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

const sentryProTeamMonthly = {
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
  isTeamPlan: false,
  isSentryPlan: true,
}

const sentryProTeamYearly = {
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
  isTeamPlan: false,
  isSentryPlan: true,
}

const availablePlans = [freePlan, sentryProTeamMonthly, sentryProTeamYearly]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
})
const server = setupServer()

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <MemoryRouter initialEntries={['/gh/codecov/upgrade']}>
    <QueryClientProvider client={queryClient}>
      <Route path="/:provider/:owner/upgrade">
        <Suspense fallback={null}>{children}</Suspense>
      </Route>
    </QueryClientProvider>
  </MemoryRouter>
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

describe('PriceCallout', () => {
  afterEach(() => vi.resetAllMocks())

  function setup(periodEnd: number | null = 1609298708) {
    const user = userEvent.setup()
    const mockSetFormValue = vi.fn()

    const mockAccountDetails = {
      subscriptionDetail: {
        currentPeriodEnd: periodEnd,
      },
    }

    server.use(
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({ data: { owner: { availablePlans } } })
      }),
      http.get('internal/gh/codecov/account-details/', () => {
        return HttpResponse.json(mockAccountDetails)
      })
    )

    return { mockSetFormValue, user }
  }

  describe('when rendered', () => {
    describe('and seat count is below acceptable range', () => {
      const props = {
        newPlan: sentryProTeamMonthly,
        seats: 4,
      }

      it('does not render calculator', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const perMonthPrice = screen.queryByText(/\$29.00/)
        expect(perMonthPrice).not.toBeInTheDocument()
      })
    })

    describe('isPerYear is set to true', () => {
      const props = {
        newPlan: sentryProTeamYearly,
        seats: 10,
      }

      it('displays per month price', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const perMonthPrice = await screen.findByText(/\$79.00/)
        expect(perMonthPrice).toBeInTheDocument()
      })

      it('displays billed annually at price', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const annualPrice = await screen.findByText(
          /\/month billed annually at \$948.00/
        )
        expect(annualPrice).toBeInTheDocument()
      })

      it('displays how much the user saves', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const moneySaved = await screen.findByText(/\$372.00/)
        expect(moneySaved).toBeInTheDocument()

        const sentryText = await screen.findByText(
          /with the Sentry bundle plan/
        )
        expect(sentryText).toBeInTheDocument()
      })

      it('displays the next billing date', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const nextBillingDate = await screen.findByText(/next billing date/)
        expect(nextBillingDate).toBeInTheDocument()
      })
    })

    describe('isPerYear is set to false', () => {
      const props = {
        newPlan: sentryProTeamMonthly,
        seats: 10,
      }

      it('displays the monthly price', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const monthlyPrice = await screen.findByText(/\$89.00/)
        expect(monthlyPrice).toBeInTheDocument()
      })

      it('displays what the user saves with sentry bundle', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const sentryText = await screen.findByText(/with the Sentry bundle/)
        expect(sentryText).toBeInTheDocument()
      })

      it('displays the next billing date', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        const nextBillingDate = await screen.findByText(/next billing date/)
        expect(nextBillingDate).toBeInTheDocument()
      })

      it('does not display switch to annual button', async () => {
        setup()
        render(<PriceCallout {...props} />, {
          wrapper,
        })

        expect(await screen.findByText(/\$89.00/)).toBeInTheDocument()

        const switchToAnnual = screen.queryByRole('button', {
          name: 'switch to annual',
        })
        expect(switchToAnnual).not.toBeInTheDocument()
      })
    })

    describe('when no current end period date on subscription', () => {
      it('does not render next billing date info', async () => {
        setup(null)
        const props = {
          newPlan: sentryProTeamMonthly,
          seats: 10,
        }

        render(<PriceCallout {...props} />, {
          wrapper,
        })

        expect(await screen.findByText(/\$89.00/)).toBeInTheDocument()

        const nextBillingDate = screen.queryByText(/next billing date/)
        expect(nextBillingDate).not.toBeInTheDocument()
      })
    })
  })
})
