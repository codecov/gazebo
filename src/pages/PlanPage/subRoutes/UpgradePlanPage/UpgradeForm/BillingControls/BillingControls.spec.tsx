import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import BillingControls from './BillingControls'

const proPlanMonth = {
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
  monthlyUploadLimit: 250,
  quantity: 10,
}

const proPlanYear = {
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
  monthlyUploadLimit: 250,
  quantity: 10,
}

const sentryPlanMonth = {
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
  monthlyUploadLimit: 250,
  trialDays: 14,
}

const sentryPlanYear = {
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
  monthlyUploadLimit: 250,
  trialDays: 14,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh']}>
      <Route path="/:provider">
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

describe('BillingControls', () => {
  function setup() {
    server.use(
      graphql.query('GetAvailablePlans', (req, res, ctx) =>
        res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans: [
                proPlanMonth,
                proPlanYear,
                sentryPlanMonth,
                sentryPlanYear,
              ],
            },
          })
        )
      )
    )

    const mockSetValue = jest.fn()
    const user = userEvent.setup()

    return { user, mockSetValue }
  }

  describe('user is doing a sentry upgrade', () => {
    describe('planString is set to annual plan', () => {
      it('renders annual button as "selected"', async () => {
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-sentryy"
            isSentryUpgrade={true}
            setValue={mockSetValue}
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

      it('renders correct pricing scheme', async () => {
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-sentryy"
            isSentryUpgrade={true}
            setValue={mockSetValue}
          />,
          {
            wrapper,
          }
        )

        const cost = await screen.findByText(/\$10/)
        expect(cost).toBeInTheDocument()

        const content = await screen.findByText(/\/per seat, billed annually/)
        expect(content).toBeInTheDocument()
      })

      describe('user clicks on monthly button', () => {
        it('calls setValue', async () => {
          const { mockSetValue, user } = setup()

          render(
            <BillingControls
              planString="users-sentryy"
              isSentryUpgrade={true}
              setValue={mockSetValue}
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
            expect(mockSetValue).toBeCalledWith('newPlan', 'users-sentrym')
          )
        })
      })
    })

    describe('planString is set to a monthly plan', () => {
      it('renders monthly button as "selected"', async () => {
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-sentrym"
            isSentryUpgrade={true}
            setValue={mockSetValue}
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
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-sentrym"
            isSentryUpgrade={true}
            setValue={mockSetValue}
          />,
          {
            wrapper,
          }
        )

        const cost = await screen.findByText(/\$12/)
        expect(cost).toBeInTheDocument()

        const content = await screen.findByText(/\/per seat, billed monthly/)
        expect(content).toBeInTheDocument()
      })

      describe('user clicks on annual button', () => {
        it('calls setValue', async () => {
          const { mockSetValue, user } = setup()

          render(
            <BillingControls
              planString="users-sentrym"
              isSentryUpgrade={true}
              setValue={mockSetValue}
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
            expect(mockSetValue).toBeCalledWith('newPlan', 'users-sentryy')
          )
        })
      })
    })
  })

  describe('user is not doing a sentry upgrade', () => {
    describe('planString is set to annual plan', () => {
      it('renders annual button as "selected"', async () => {
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-pr-inappy"
            isSentryUpgrade={false}
            setValue={mockSetValue}
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

      it('renders correct pricing scheme', async () => {
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-pr-inappy"
            isSentryUpgrade={false}
            setValue={mockSetValue}
          />,
          {
            wrapper,
          }
        )

        const cost = await screen.findByText(/\$10/)
        expect(cost).toBeInTheDocument()

        const content = await screen.findByText(/\/per seat, billed annually/)
        expect(content).toBeInTheDocument()
      })

      describe('user clicks on monthly button', () => {
        it('calls setValue', async () => {
          const { mockSetValue, user } = setup()

          render(
            <BillingControls
              planString="users-pr-inappy"
              isSentryUpgrade={false}
              setValue={mockSetValue}
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
            expect(mockSetValue).toBeCalledWith('newPlan', 'users-pr-inappm')
          )
        })
      })
    })

    describe('planString is set to a monthly plan', () => {
      it('renders monthly button as "selected"', async () => {
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-pr-inappm"
            isSentryUpgrade={false}
            setValue={mockSetValue}
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
        const { mockSetValue } = setup()

        render(
          <BillingControls
            planString="users-pr-inappm"
            isSentryUpgrade={false}
            setValue={mockSetValue}
          />,
          {
            wrapper,
          }
        )

        const cost = await screen.findByText(/\$12/)
        expect(cost).toBeInTheDocument()

        const content = await screen.findByText(/\/per seat, billed monthly/)
        expect(content).toBeInTheDocument()
      })

      describe('user clicks on annual button', () => {
        it('calls setValue', async () => {
          const { mockSetValue, user } = setup()

          render(
            <BillingControls
              planString="users-pr-inappm"
              isSentryUpgrade={false}
              setValue={mockSetValue}
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
            expect(mockSetValue).toBeCalledWith('newPlan', 'users-pr-inappy')
          )
        })
      })
    })
  })
})
