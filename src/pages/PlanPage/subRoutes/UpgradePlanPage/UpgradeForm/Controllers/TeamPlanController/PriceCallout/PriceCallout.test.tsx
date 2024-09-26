import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, http, HttpResponse } from 'msw2'
import { setupServer } from 'msw2/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import PriceCallout from './PriceCallout'

const availablePlans = [
  {
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
  },
  {
    marketingName: 'Pro',
    value: 'users-pr-inappm',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Team',
    value: 'users-teamm',
    billingRate: 'monthly',
    baseUnitPrice: 5,
    benefits: ['Patch coverage analysis'],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Team',
    value: 'users-teamy',
    billingRate: 'yearly',
    baseUnitPrice: 4,
    benefits: ['Patch coverage analysis'],
    monthlyUploadLimit: null,
  },
]

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
        latestInvoice: {
          periodEnd: periodEnd,
        },
      },
    }

    server.use(
      graphql.query('GetAvailablePlans', (info) => {
        return HttpResponse.json({
          data: { owner: { availablePlans } },
        })
      }),
      http.get('internal/gh/codecov/account-details/', (info) => {
        return HttpResponse.json(mockAccountDetails)
      })
    )

    return { mockSetFormValue, user }
  }

  describe('when rendered', () => {
    describe('and seat count is below acceptable range', () => {
      const props = {
        newPlan: Plans.USERS_TEAMY,
        seats: 1,
      }

      it('does not render calculator', async () => {
        const { mockSetFormValue } = setup()

        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const perMonthPrice = screen.queryByText(/\$4.00/)
        expect(perMonthPrice).not.toBeInTheDocument()
      })
    })

    describe('and seat count is above acceptable range', () => {
      const props = {
        newPlan: Plans.USERS_TEAMY,
        seats: 11,
      }

      it('does not render calculator', async () => {
        const { mockSetFormValue } = setup()

        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const perMonthPrice = screen.queryByText(/\$44.00/)
        expect(perMonthPrice).not.toBeInTheDocument()
      })
    })
    describe('isPerYear is set to true', () => {
      const props = {
        newPlan: Plans.USERS_TEAMY,
        seats: 10,
      }

      it('displays per month price', async () => {
        const { mockSetFormValue } = setup()

        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const perMonthPrice = await screen.findByText(/\$40.00/)
        expect(perMonthPrice).toBeInTheDocument()
      })

      it('displays billed annually at price', async () => {
        const { mockSetFormValue } = setup()

        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const annualPrice = await screen.findByText(
          /\/month billed annually at \$480.00/
        )
        expect(annualPrice).toBeInTheDocument()
      })

      it('displays how much the user saves', async () => {
        const { mockSetFormValue } = setup()

        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const moneySaved = await screen.findByText(/\$120.00/)
        expect(moneySaved).toBeInTheDocument()
      })

      it('displays the next billing date', async () => {
        const { mockSetFormValue } = setup()

        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const nextBillingDate = await screen.findByText(/next billing date/)
        expect(nextBillingDate).toBeInTheDocument()
      })
    })

    describe('isPerYear is set to false', () => {
      const props = {
        newPlan: Plans.USERS_TEAMM,
        seats: 10,
      }

      it('displays the monthly price', async () => {
        const { mockSetFormValue } = setup()
        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const monthlyPrice = await screen.findByText(/\$50.00/)
        expect(monthlyPrice).toBeInTheDocument()
      })

      it('displays what the user could save with annual plan', async () => {
        const { mockSetFormValue } = setup()
        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const savings = await screen.findByText(/\$120.00/)
        expect(savings).toBeInTheDocument()
      })

      it('displays the next billing date', async () => {
        const { mockSetFormValue } = setup()

        render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
          wrapper,
        })

        const nextBillingDate = await screen.findByText(/next billing date/)
        expect(nextBillingDate).toBeInTheDocument()
      })

      describe('user switches to annual plan', () => {
        it('calls mock set value with pro annual plan', async () => {
          const { mockSetFormValue, user } = setup()
          render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
            wrapper,
          })

          const switchToAnnual = await screen.findByRole('button', {
            name: 'switch to annual',
          })
          expect(switchToAnnual).toBeInTheDocument()

          await user.click(switchToAnnual)

          expect(mockSetFormValue).toHaveBeenCalledWith(
            'newPlan',
            Plans.USERS_TEAMY
          )
        })
      })

      describe('when no current end period date on subscription', () => {
        it('does not render next billing date info', async () => {
          const props = {
            newPlan: Plans.USERS_TEAMM,
            seats: 10,
          }

          const { mockSetFormValue } = setup()

          render(<PriceCallout {...props} setFormValue={mockSetFormValue} />, {
            wrapper,
          })

          const nextBillingDate = screen.queryByText(/next billing date/)
          expect(nextBillingDate).not.toBeInTheDocument()
        })
      })
    })
  })
})
