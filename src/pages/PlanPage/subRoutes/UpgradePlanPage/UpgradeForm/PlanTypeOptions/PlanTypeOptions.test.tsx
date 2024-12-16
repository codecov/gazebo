import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { BillingRate, PlanName, Plans } from 'shared/utils/billing'

import PlanTypeOptions from './PlanTypeOptions'

const basicPlan = {
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

const trialPlan = {
  marketingName: 'Pro Trial Team',
  value: Plans.USERS_TRIAL,
  billingRate: null,
  baseUnitPrice: 12,
  benefits: ['Configurable # of users', 'Unlimited repos'],
  monthlyUploadLimit: null,
}

const server = setupServer()
const queryClient = new QueryClient({
  defaultOptions: { queries: { suspense: true } },
})

let testLocation: ReturnType<typeof useLocation>
const wrapper =
  (initialEntries = '/gh/codecov'): React.FC<React.PropsWithChildren> =>
  ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialEntries]}>
        <Route path="/:provider/:owner">
          <Suspense fallback={null}>{children}</Suspense>
        </Route>
        <Route
          path="*"
          render={({ location }) => {
            testLocation = location
            return null
          }}
        />
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
  planValue: PlanName
  hasSentryPlans: boolean
  hasTeamPlans: boolean
}

describe('PlanTypeOptions', () => {
  function setup(
    {
      planValue = Plans.USERS_BASIC,
      hasSentryPlans = false,
      hasTeamPlans = true,
    }: SetupArgs = {
      planValue: Plans.USERS_BASIC,
      hasTeamPlans: true,
      hasSentryPlans: false,
    }
  ) {
    server.use(
      graphql.query('GetAvailablePlans', () => {
        return HttpResponse.json({
          data: {
            owner: {
              availablePlans: [
                proPlanMonth,
                proPlanYear,
                ...(hasTeamPlans ? [teamPlanMonth, teamPlanYear] : []),
                ...(hasSentryPlans ? [sentryPlanMonth, sentryPlanYear] : []),
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
          isEnterprisePlan: false,
        }
        if (planValue === Plans.USERS_BASIC) {
          return HttpResponse.json({
            data: { plan: { ...basicPlan, ...planChunk } },
          })
        } else if (planValue === Plans.USERS_PR_INAPPY) {
          return HttpResponse.json({
            data: { plan: { ...proPlanYear, ...planChunk } },
          })
        } else if (planValue === Plans.USERS_TRIAL) {
          return HttpResponse.json({
            data: { plan: { ...trialPlan, ...planChunk } },
          })
        } else if (planValue === Plans.USERS_TEAMY) {
          return HttpResponse.json({
            data: { plan: { ...teamPlanYear, ...planChunk } },
          })
        } else if (planValue === Plans.USERS_TEAMM) {
          return HttpResponse.json({
            data: { plan: { ...teamPlanMonth, ...planChunk } },
          })
        } else if (planValue === Plans.USERS_SENTRYY) {
          return HttpResponse.json({
            data: { plan: { ...sentryPlanYear, ...planChunk } },
          })
        }
      })
    )

    const mockSetFormValue = vi.fn()
    const mockSetSelectedPlan = vi.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue, mockSetSelectedPlan, planValue }
  }

  describe('user is doing a sentry upgrade', () => {
    describe('when plan is basic', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_BASIC,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
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

      describe('plan param is set to team', () => {
        it('renders Team button as "selected"', async () => {
          const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
            planValue: Plans.USERS_BASIC,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper('/gh/codecov?plan=team'),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          expect(proBtn).not.toHaveClass('bg-ds-primary-base')

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          expect(teamBtn).toHaveClass('bg-ds-primary-base')
        })
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_SENTRYY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(sentryPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is sentry yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
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
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_SENTRYY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(sentryPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is team yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_TEAMY,
          hasSentryPlans: true,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const teamBtn = await screen.findByRole('button', {
          name: 'Team',
        })
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).toHaveClass('bg-ds-primary-base')

        const proBtn = await screen.findByRole('button', {
          name: 'Pro',
        })
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).not.toHaveClass('bg-ds-primary-base')
      })

      describe('plan param is set to pro', () => {
        it('renders Pro button as "selected"', async () => {
          const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper('/gh/codecov?plan=pro'),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          expect(proBtn).not.toHaveClass('bg-ds-primary-base')

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          expect(teamBtn).toHaveClass('bg-ds-primary-base')
        })
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_SENTRYY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(sentryPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is trialing', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_TRIAL,
          hasSentryPlans: true,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
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
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_SENTRYY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(sentryPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: true,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })
  })

  describe('user is not doing a sentry upgrade', () => {
    describe('when plan is basic', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_BASIC,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
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
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(proPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_BASIC,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is pro yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_PR_INAPPY,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
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
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(proPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_SENTRYY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is team yearly', () => {
      it('renders Team button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_TEAMY,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByRole('button', {
          name: 'Pro',
        })
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).not.toHaveClass('bg-ds-primary-base')

        const teamBtn = await screen.findByRole('button', {
          name: 'Team',
        })
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).toHaveClass('bg-ds-primary-base')
      })

      describe('plan param is set to team', () => {
        it('renders Team button as "selected"', async () => {
          const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper('/gh/codecov?plan=team'),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          expect(proBtn).not.toHaveClass('bg-ds-primary-base')

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          expect(teamBtn).toHaveClass('bg-ds-primary-base')
        })
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(proPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TEAMY,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is trialing', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan, planValue } = setup({
          planValue: Plans.USERS_TRIAL,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={planValue}
          />,
          {
            wrapper: wrapper(),
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
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_TEAMY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByRole('button', {
            name: 'Team',
          })
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })

      describe('user clicks Pro button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              Plans.USERS_PR_INAPPY
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(proPlanYear)
          )
        })

        it('sets plan query param to pro', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan, planValue } =
            setup({
              planValue: Plans.USERS_TRIAL,
              hasSentryPlans: false,
              hasTeamPlans: true,
            })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={planValue}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const proBtn = await screen.findByRole('button', {
            name: 'Pro',
          })
          expect(proBtn).toBeInTheDocument()
          await user.click(proBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })
  })
  describe('when plan is team plan monthly', () => {
    it('keeps monthly selection when updating to pro plan', async () => {
      const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
        planValue: Plans.USERS_TEAMM,
        hasSentryPlans: false,
        hasTeamPlans: true,
      })

      render(
        <PlanTypeOptions
          setFormValue={mockSetFormValue}
          setSelectedPlan={mockSetSelectedPlan}
          newPlan="users-teamm"
        />,
        {
          wrapper: wrapper(),
        }
      )

      const proBtn = await screen.findByRole('button', {
        name: 'Pro',
      })
      expect(proBtn).toBeInTheDocument()
      await user.click(proBtn)

      await waitFor(() =>
        expect(mockSetFormValue).toHaveBeenCalledWith(
          'newPlan',
          Plans.USERS_PR_INAPPM
        )
      )
      await waitFor(() =>
        expect(mockSetSelectedPlan).toHaveBeenCalledWith(proPlanMonth)
      )
    })
  })
})
