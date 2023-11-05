import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import TotalBanner from './TotalBanner'

const allPlans = [
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
    quantity: 1,
    monthlyUploadLimit: 250,
  },
  {
    marketingName: 'Pro Team',
    value: 'users-pr-inappm',
    billingRate: 'monthly',
    baseUnitPrice: 12,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    quantity: 10,
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Pro Team',
    value: 'users-pr-inappy',
    billingRate: 'annually',
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
    quantity: 10,
  },
  {
    marketingName: 'Pro Team',
    value: 'users-enterprisem',
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
    marketingName: 'Pro Team',
    value: 'users-enterprisey',
    billingRate: 'annually',
    baseUnitPrice: 10,
    benefits: [
      'Configurable # of users',
      'Unlimited public repositories',
      'Unlimited private repositories',
      'Priority Support',
    ],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentrym',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: ['Includes 5 seats', 'Unlimited public repositories'],
    monthlyUploadLimit: null,
  },
  {
    marketingName: 'Sentry',
    value: 'users-sentryy',
    billingRate: null,
    baseUnitPrice: 10,
    benefits: ['Includes 5 seats', 'Unlimited private repositories'],
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

describe('TotalBanner', () => {
  afterEach(() => jest.resetAllMocks())

  function setup() {
    const user = userEvent.setup()
    const mockSetValue = jest.fn()

    server.use(
      graphql.query('GetAvailablePlans', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: { availablePlans: allPlans },
          })
        )
      )
    )

    return { mockSetValue, user }
  }

  describe('when rendered', () => {
    describe('isPerYear is set to true', () => {
      const props = {
        newPlan: Plans.USERS_PR_INAPPY,
        seats: 10,
      }

      it('displays per month price', async () => {
        const { mockSetValue } = setup()

        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const perMonthPrice = await screen.findByText(/\$100.00/)
        expect(perMonthPrice).toBeInTheDocument()
      })

      it('displays billed annually at price', async () => {
        const { mockSetValue } = setup()

        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const annualPrice = await screen.findByText(
          /\/per month billed annually at \$1,200.00/
        )
        expect(annualPrice).toBeInTheDocument()
      })

      it('displays how much the user saves', async () => {
        const { mockSetValue } = setup()

        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const moneySaved = await screen.findByText(/\$240.00/)
        expect(moneySaved).toBeInTheDocument()
      })
    })

    describe('isPerYear is set to false', () => {
      const props = {
        newPlan: Plans.USERS_PR_INAPPM,
        seats: 10,
      }

      it('displays the monthly price', async () => {
        const { mockSetValue } = setup()
        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const monthlyPrice = await screen.findByText(/\$120.00/)
        expect(monthlyPrice).toBeInTheDocument()
      })

      it('displays what the user could save with annual plan', async () => {
        const { mockSetValue } = setup()
        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const savings = await screen.findByText(/\$240.00/)
        expect(savings).toBeInTheDocument()
      })

      describe('user switches to annual plan', () => {
        it('calls mock set value with pro annual plan', async () => {
          const { mockSetValue, user } = setup()
          render(<TotalBanner {...props} setValue={mockSetValue} />, {
            wrapper,
          })

          const switchToAnnual = await screen.findByRole('button', {
            name: 'switch to annual',
          })
          expect(switchToAnnual).toBeInTheDocument()

          await user.click(switchToAnnual)

          expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_PR_INAPPY)
        })
      })
    })
  })
})
