import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, rest } from 'msw'
import { setupServer } from 'msw/node'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { Plans } from 'shared/utils/billing'

import PlanDetailsOptions from './PlanDetailsOptions'

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
}

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamm',
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: 'users-teamy',
}

const trialPlan = {
  marketingName: 'Pro Trial Team',
  value: 'users-trial',
  billingRate: null,
  baseUnitPrice: 12,
  benefits: ['Configurable # of users', 'Unlimited repos'],
  monthlyUploadLimit: null,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={['/gh/codecov']}>
      <Route path="/:provider/:owner">
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

const mockAccountDetailsBasic = {
  plan: basicPlan,
  activatedUserCount: 1,
  inactiveUserCount: 0,
}

const mockAccountDetailsProYearly = {
  plan: proPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockAccountDetailsTeamYearly = {
  plan: teamPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockAccountDetailsSentryYearly = {
  plan: sentryPlanYear,
  activatedUserCount: 11,
  inactiveUserCount: 0,
}

const mockAccountDetailsTrial = {
  plan: trialPlan,
  activatedUserCount: 28,
  inactiveUserCount: 0,
}

type SetupArgs = {
  planValue: string
  hasSentryPlans: boolean
}

describe('PlanDetailsOptions', () => {
  function setup(
    { planValue = Plans.USERS_BASIC, hasSentryPlans = false }: SetupArgs = {
      planValue: Plans.USERS_BASIC,
      hasSentryPlans: false,
    }
  ) {
    server.use(
      rest.get(`/internal/gh/codecov/account-details/`, (req, res, ctx) => {
        if (planValue === Plans.USERS_BASIC) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsBasic))
        } else if (planValue === Plans.USERS_PR_INAPPY) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsProYearly))
        } else if (planValue === Plans.USERS_TRIAL) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsTrial))
        } else if (planValue === Plans.USERS_TEAMY) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsTeamYearly))
        } else if (planValue === Plans.USERS_SENTRYY) {
          return res(ctx.status(200), ctx.json(mockAccountDetailsSentryYearly))
        }
      }),
      graphql.query('GetAvailablePlans', (req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.data({
            owner: {
              availablePlans: [
                proPlanMonth,
                proPlanYear,
                teamPlanMonth,
                teamPlanYear,
                ...(hasSentryPlans ? [sentryPlanMonth, sentryPlanYear] : []),
              ],
            },
          })
        )
      })
    )

    const mockSetValue = jest.fn()
    const mockSetSelectedPlan = jest.fn()
    const user = userEvent.setup()

    return { user, mockSetValue, mockSetSelectedPlan }
  }

  describe('user is doing a sentry upgrade', () => {
    describe('when plan is basic', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_BASIC,
          hasSentryPlans: false,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_BASIC,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_BASIC,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_SENTRYY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(sentryPlanYear)
          )
        })
      })
    })

    describe('when plan is sentry yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_SENTRYY,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_SENTRYY,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_SENTRYY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(sentryPlanYear)
          )
        })
      })
    })

    describe('when plan is team yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TEAMY,
          hasSentryPlans: true,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_SENTRYY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(sentryPlanYear)
          )
        })
      })
    })

    describe('when plan is trialing', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TRIAL,
          hasSentryPlans: true,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: true,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_SENTRYY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(sentryPlanYear)
          )
        })
      })
    })
  })

  describe('user is not doing a sentry upgrade', () => {
    describe('when plan is basic', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_BASIC,
          hasSentryPlans: false,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_BASIC,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_BASIC,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(proPlanYear)
          )
        })
      })
    })

    describe('when plan is pro yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_PR_INAPPY,
          hasSentryPlans: false,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_SENTRYY,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_SENTRYY,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(proPlanYear)
          )
        })
      })
    })

    describe('when plan is team yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TEAMY,
          hasSentryPlans: false,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(proPlanYear)
          )
        })
      })
    })

    describe('when plan is trialing', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TRIAL,
          hasSentryPlans: false,
        })

        render(
          <PlanDetailsOptions
            setValue={mockSetValue}
            setSelectedPlan={mockSetSelectedPlan}
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
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith('newPlan', Plans.USERS_TEAMY)
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(teamPlanYear)
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: false,
          })

          render(
            <PlanDetailsOptions
              setValue={mockSetValue}
              setSelectedPlan={mockSetSelectedPlan}
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
            expect(mockSetValue).toBeCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toBeCalledWith(proPlanYear)
          )
        })
      })
    })
  })
})
