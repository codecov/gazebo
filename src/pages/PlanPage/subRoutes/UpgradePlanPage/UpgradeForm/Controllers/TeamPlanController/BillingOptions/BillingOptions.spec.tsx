import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import BillingOptions from './BillingOptions'

const availablePlans = [
  {
    marketingName: 'Basic',
    value: 'users-basic',
    billingRate: null,
    baseUnitPrice: 0,
    benefits: [
      'Up to 5 users',
      'Unlimited public repositories',
      'Unlimited private repositories',
    ],
    monthlyUploadLimit: 250,
  },
  {
    baseUnitPrice: 5,
    benefits: ['Up to 10 users'],
    billingRate: 'monthly',
    marketingName: 'Team',
    monthlyUploadLimit: 2500,
    value: 'users-teamm',
  },
  {
    baseUnitPrice: 4,
    benefits: ['Up to 10 users'],
    billingRate: 'annually',
    marketingName: 'Team',
    monthlyUploadLimit: 2500,
    value: 'users-teamy',
  },
]

const mockPlanDataResponse = {
  baseUnitPrice: 10,
  benefits: [],
  billingRate: 'monthly',
  marketingName: 'Team',
  monthlyUploadLimit: 250,
  value: 'test-plan',
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 1,
  hasSeatsLeft: true,
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

describe('BillingOptions', () => {
  function setup() {
    server.use(
      graphql.query('GetAvailablePlans', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans,
            },
          })
        )
      ),
      graphql.query('GetPlanData', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              hasPrivateRepos: true,
              plan: mockPlanDataResponse,
            },
          })
        )
      })
    )

    const mockSetFormValue = jest.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue }
  }

  describe('when rendered', () => {
    describe('planString is set to annual plan', () => {
      it('renders annual button as "selected"', async () => {
        const { mockSetFormValue } = setup()

        render(
          <BillingOptions
            newPlan={Plans.USERS_TEAMY}
            setFormValue={mockSetFormValue}
          />,
          {
            wrapper,
          }
        )

        const annualBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(annualBtn).toBeInTheDocument()
        expect(annualBtn).toHaveClass('bg-ds-primary-base')

        const monthlyBtn = await screen.findByRole('button', {
          name: 'Monthly',
        })
        expect(monthlyBtn).toBeInTheDocument()
        expect(monthlyBtn).not.toHaveClass('bg-ds-primary-base')
      })

      it('renders annual pricing scheme', async () => {
        const { mockSetFormValue } = setup()

        render(
          <BillingOptions
            newPlan={Plans.USERS_TEAMY}
            setFormValue={mockSetFormValue}
          />,
          {
            wrapper,
          }
        )

        const cost = await screen.findByText(/\$4/)
        expect(cost).toBeInTheDocument()

        const content = await screen.findByText(
          /per seat\/month, billed annually/
        )
        expect(content).toBeInTheDocument()
      })

      describe('user clicks on monthly button', () => {
        it('calls setValue', async () => {
          const { mockSetFormValue, user } = setup()

          render(
            <BillingOptions
              newPlan={Plans.USERS_TEAMY}
              setFormValue={mockSetFormValue}
            />,
            {
              wrapper,
            }
          )

          const monthlyBtn = await screen.findByRole('button', {
            name: 'Monthly',
          })
          expect(monthlyBtn).toBeInTheDocument()
          await user.click(monthlyBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMM
            )
          )
        })
      })
    })

    describe('planString is set to a monthly plan', () => {
      it('renders monthly button as "selected"', async () => {
        const { mockSetFormValue } = setup()

        render(
          <BillingOptions
            newPlan={Plans.USERS_TEAMM}
            setFormValue={mockSetFormValue}
          />,
          {
            wrapper,
          }
        )

        const annualBtn = await screen.findByRole('button', { name: 'Annual' })
        expect(annualBtn).toBeInTheDocument()
        expect(annualBtn).not.toHaveClass('bg-ds-primary-base')

        const monthlyBtn = await screen.findByRole('button', {
          name: 'Monthly',
        })
        expect(monthlyBtn).toBeInTheDocument()
        expect(monthlyBtn).toHaveClass('bg-ds-primary-base')
      })

      it('renders correct pricing scheme', async () => {
        const { mockSetFormValue } = setup()

        render(
          <BillingOptions
            newPlan={Plans.USERS_TEAMM}
            setFormValue={mockSetFormValue}
          />,
          {
            wrapper,
          }
        )

        const cost = await screen.findByText(/\$5/)
        expect(cost).toBeInTheDocument()

        const content = await screen.findByText(
          /per seat\/month, billed monthly/
        )
        expect(content).toBeInTheDocument()
      })

      describe('user clicks on annual button', () => {
        it('calls setValue', async () => {
          const { mockSetFormValue, user } = setup()

          render(
            <BillingOptions
              newPlan={Plans.USERS_TEAMM}
              setFormValue={mockSetFormValue}
            />,
            {
              wrapper,
            }
          )

          const annualBtn = await screen.findByRole('button', {
            name: 'Annual',
          })
          expect(annualBtn).toBeInTheDocument()
          await user.click(annualBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
        })
      })
    })
  })
})
