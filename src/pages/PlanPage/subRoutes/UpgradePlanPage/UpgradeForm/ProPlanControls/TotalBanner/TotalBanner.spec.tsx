import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import TotalBanner from './TotalBanner'

const sentryProMonth = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentrym',
  billingRate: 'monthly',
  baseUnitPrice: 12,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
}

const sentryProYear = {
  marketingName: 'Sentry Pro Team',
  value: 'users-sentryy',
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Includes 5 seats',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
  trialDays: 14,
}

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
            owner: { availablePlans: [sentryProMonth, sentryProYear] },
          })
        )
      )
    )

    return { mockSetValue, user }
  }

  describe('user cannot apply a sentry upgrade', () => {
    describe('isPerYear is set to true', () => {
      const props = {
        isPerYear: true,
        perYearPrice: 100,
        perMonthPrice: 120,
      }

      it('displays per month price', () => {
        const { mockSetValue } = setup()

        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const perMonthPrice = screen.getByText(/\$100.00/)
        expect(perMonthPrice).toBeInTheDocument()
      })

      it('displays billed annually at price', () => {
        const { mockSetValue } = setup()

        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const annualPrice = screen.getByText(
          /\/per month billed annually at \$1,200.00/
        )
        expect(annualPrice).toBeInTheDocument()
      })

      it('displays how much the user saves', () => {
        const { mockSetValue } = setup()

        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const moneySaved = screen.getByText(/\$240.00/)
        expect(moneySaved).toBeInTheDocument()
      })
    })

    describe('isPerYear is set to false', () => {
      const props = {
        isPerYear: false,
        perYearPrice: 100,
        perMonthPrice: 120,
      }

      it('displays the monthly price', () => {
        const { mockSetValue } = setup()
        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const monthlyPrice = screen.getByText(/\$120.00/)
        expect(monthlyPrice).toBeInTheDocument()
      })

      it('displays what the user could save with annual plan', () => {
        const { mockSetValue } = setup()
        render(<TotalBanner {...props} setValue={mockSetValue} />, { wrapper })

        const savings = screen.getByText(/\$240.00/)
        expect(savings).toBeInTheDocument()
      })

      describe('user switches to annual plan', () => {
        it('calls mock set value with pro annual plan', async () => {
          const { mockSetValue, user } = setup()
          render(<TotalBanner {...props} setValue={mockSetValue} />, {
            wrapper,
          })

          const switchToAnnual = screen.getByRole('button', {
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
