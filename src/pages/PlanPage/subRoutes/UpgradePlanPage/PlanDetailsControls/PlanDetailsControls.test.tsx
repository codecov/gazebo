import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { BillingRate, Plans } from 'shared/utils/billing'

import PlanDetailsControls from './PlanDetailsControls'

const proPlanMonth = {
  marketingName: 'Pro Team',
  value: Plans.USERS_PR_INAPPM,
  billingRate: BillingRate.MONTHLY,
  baseUnitPrice: 12,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: 250,
}

const proPlanYear = {
  marketingName: 'Pro Team',
  value: Plans.USERS_PR_INAPPY,
  billingRate: BillingRate.ANNUALLY,
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: 250,
}

const sentryPlanMonth = {
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
  monthlyUploadLimit: 250,
}

const sentryPlanYear = {
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
  monthlyUploadLimit: 250,
}

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
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

type SetupArgs = {
  hasSentryPlans: boolean
}

describe('PlanDetailsControls', () => {
  function setup(
    { hasSentryPlans = false }: SetupArgs = { hasSentryPlans: false }
  ) {
    server.use(
      graphql.query('GetAvailablePlans', () => {
        if (hasSentryPlans) {
          return HttpResponse.json({
            data: {
              owner: {
                availablePlans: [
                  proPlanMonth,
                  proPlanYear,
                  sentryPlanMonth,
                  sentryPlanYear,
                  teamPlanMonth,
                  teamPlanYear,
                ],
              },
            },
          })
        } else {
          return HttpResponse.json({
            data: {
              owner: {
                availablePlans: [
                  proPlanMonth,
                  proPlanYear,
                  teamPlanMonth,
                  teamPlanYear,
                ],
              },
            },
          })
        }
      })
    )

    const mockSetValue = vi.fn()
    const mockSetSelectedPlan = vi.fn()
    const user = userEvent.setup()

    return { user, mockSetValue, mockSetSelectedPlan }
  }

  describe('user is doing a sentry upgrade', () => {
    it('renders Pro button as "selected"', async () => {
      const { mockSetValue, mockSetSelectedPlan } = setup({
        hasSentryPlans: true,
      })

      render(
        <PlanDetailsControls
          setValue={mockSetValue}
          setSelectedPlan={mockSetSelectedPlan}
          isSentryUpgrade={true}
        />,
        {
          wrapper,
        }
      )

      const proBtn = await screen.findByRole('button', {
        name: 'Pro',
      })
      expect(proBtn).toBeInTheDocument()
      expect(proBtn).toHaveClass('bg-ds-primary-base')

      const teamBtn = await screen.findByRole('button', {
        name: 'Team',
      })
      expect(teamBtn).toBeInTheDocument()
      expect(teamBtn).not.toHaveClass('bg-ds-primary-base')
    })

    describe('user clicks Team button', () => {
      it('calls setValue and setSelectedPlan', async () => {
        const { user, mockSetValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: true,
        })

        render(
          <PlanDetailsControls
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
            isSentryUpgrade={true}
          />,
          {
            wrapper,
          }
        )

        const teamBtn = await screen.findByRole('button', {
          name: 'Team',
        })
        expect(teamBtn).toBeInTheDocument()
        await user.click(teamBtn)

        await waitFor(() =>
          expect(mockSetValue).toHaveBeenCalledWith('newPlan', teamPlanYear)
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
        )
      })
    })

    describe('user clicks Pro button', () => {
      it('calls setValue and setSelectedPlan', async () => {
        const { user, mockSetValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: true,
        })

        render(
          <PlanDetailsControls
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
            isSentryUpgrade={true}
          />,
          {
            wrapper,
          }
        )

        const proBtn = await screen.findByRole('button', {
          name: 'Pro',
        })
        expect(proBtn).toBeInTheDocument()
        await user.click(proBtn)

        await waitFor(() =>
          expect(mockSetValue).toHaveBeenCalledWith('newPlan', sentryPlanYear)
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toHaveBeenCalledWith(sentryPlanYear)
        )
      })
    })
  })

  describe('user is not doing a sentry upgrade', () => {
    it('renders Pro button as "selected"', async () => {
      const { mockSetValue, mockSetSelectedPlan } = setup({
        hasSentryPlans: false,
      })

      render(
        <PlanDetailsControls
          setValue={mockSetValue}
          setSelectedPlan={mockSetSelectedPlan}
          isSentryUpgrade={false}
        />,
        {
          wrapper,
        }
      )

      const proBtn = await screen.findByRole('button', {
        name: 'Pro',
      })
      expect(proBtn).toBeInTheDocument()
      expect(proBtn).toHaveClass('bg-ds-primary-base')

      const teamBtn = await screen.findByRole('button', {
        name: 'Team',
      })
      expect(teamBtn).toBeInTheDocument()
      expect(teamBtn).not.toHaveClass('bg-ds-primary-base')
    })

    describe('user clicks Team button', () => {
      it('calls setValue and setSelectedPlan', async () => {
        const { user, mockSetValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: false,
        })

        render(
          <PlanDetailsControls
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
            isSentryUpgrade={false}
          />,
          {
            wrapper,
          }
        )

        const teamBtn = await screen.findByRole('button', {
          name: 'Team',
        })
        expect(teamBtn).toBeInTheDocument()
        await user.click(teamBtn)

        await waitFor(() =>
          expect(mockSetValue).toHaveBeenCalledWith('newPlan', teamPlanYear)
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
        )
      })
    })

    describe('user clicks Pro button', () => {
      it('calls setValue and setSelectedPlan', async () => {
        const { user, mockSetValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: false,
        })

        render(
          <PlanDetailsControls
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
            isSentryUpgrade={false}
          />,
          {
            wrapper,
          }
        )

        const proBtn = await screen.findByRole('button', {
          name: 'Pro',
        })
        expect(proBtn).toBeInTheDocument()
        await user.click(proBtn)

        await waitFor(() =>
          expect(mockSetValue).toHaveBeenCalledWith('newPlan', proPlanYear)
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toHaveBeenCalledWith(proPlanYear)
        )
      })
    })
  })
})
