import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { TrialStatuses } from 'services/account/usePlanData'
import { BillingRate, PlanName, Plans } from 'shared/utils/billing'

import PlanTypeOptions from './PlanTypeOptions'

const basicPlan = {
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
  isTeamPlan: false,
  isSentryPlan: false,
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
  isTeamPlan: false,
  isSentryPlan: false,
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
  isTeamPlan: false,
  isSentryPlan: true,
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
  isTeamPlan: false,
  isSentryPlan: true,
}

const teamPlanMonth = {
  baseUnitPrice: 6,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
  isTeamPlan: true,
  isSentryPlan: false,
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
  isTeamPlan: true,
  isSentryPlan: false,
}

const trialPlan = {
  marketingName: 'Pro Trial Team',
  value: Plans.USERS_TRIAL,
  billingRate: null,
  baseUnitPrice: 12,
  benefits: ['Configurable # of users', 'Unlimited repos'],
  monthlyUploadLimit: null,
  isTeamPlan: false,
  isSentryPlan: false,
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
      planValue = Plans.USERS_DEVELOPER,
      hasSentryPlans = false,
      hasTeamPlans = true,
    }: SetupArgs = {
      planValue: Plans.USERS_DEVELOPER,
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
          isFreePlan: false,
          isProPlan: false,
          isSentryPlan: false,
          isTeamPlan: false,
          isTrialPlan: false,
        }
        if (planValue === Plans.USERS_DEVELOPER) {
          return HttpResponse.json({
            data: { plan: { ...basicPlan, ...planChunk } },
          })
        } else if (planValue === Plans.USERS_PR_INAPPY) {
          return HttpResponse.json({
            data: { plan: { ...proPlanYear, ...planChunk, isProPlan: true } },
          })
        } else if (planValue === Plans.USERS_TRIAL) {
          return HttpResponse.json({
            data: { plan: { ...trialPlan, ...planChunk, isTrialPlan: true } },
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
            data: {
              plan: { ...sentryPlanYear, ...planChunk, isProPlan: true },
            },
          })
        }
      })
    )

    const mockSetFormValue = vi.fn()
    const mockSetSelectedPlan = vi.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue, mockSetSelectedPlan }
  }

  describe('user is doing a sentry upgrade', () => {
    describe('when plan is basic', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_DEVELOPER,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={basicPlan}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('plan param is set to team', () => {
        it('renders Team button as "selected"', async () => {
          const { mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_DEVELOPER,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={basicPlan}
            />,
            {
              wrapper: wrapper('/gh/codecov?plan=team'),
            }
          )

          const proBtn = await screen.findByTestId('radio-pro')
          expect(proBtn).toBeInTheDocument()
          expect(proBtn).not.toBeChecked()

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          expect(teamBtn).toBeChecked()
        })
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_DEVELOPER,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={basicPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_DEVELOPER,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={basicPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is sentry yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_SENTRYY,
          hasSentryPlans: true,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={sentryPlanYear}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_SENTRYY,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={sentryPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_SENTRYY,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={sentryPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is team yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TEAMY,
          hasSentryPlans: true,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={teamPlanYear}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('plan param is set to pro', () => {
        it('renders Pro button as "selected"', async () => {
          const { mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={teamPlanYear}
            />,
            {
              wrapper: wrapper('/gh/codecov?plan=pro'),
            }
          )

          const proBtn = await screen.findByTestId('radio-pro')
          expect(proBtn).toBeInTheDocument()
          expect(proBtn).toBeChecked()

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          expect(teamBtn).not.toBeChecked()
        })
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={teamPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={teamPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is trialing', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TRIAL,
          hasSentryPlans: true,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={trialPlan}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={trialPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: true,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={trialPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })
  })

  describe('user is not doing a sentry upgrade', () => {
    describe('when plan is basic', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_DEVELOPER,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={basicPlan}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_DEVELOPER,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={basicPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_DEVELOPER,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={basicPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is pro yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_PR_INAPPY,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={proPlanYear}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_PR_INAPPY,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={proPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_PR_INAPPY,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={proPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is team yearly', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TEAMY,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={teamPlanYear}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('plan param is set to team', () => {
        it('renders Team button as "selected"', async () => {
          const { mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={teamPlanYear}
            />,
            {
              wrapper: wrapper('/gh/codecov?plan=team'),
            }
          )

          const proBtn = await screen.findByTestId('radio-pro')
          expect(proBtn).toBeInTheDocument()
          expect(proBtn).not.toBeChecked()

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          expect(teamBtn).toBeChecked()
        })
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={teamPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TEAMY,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={teamPlanYear}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })

    describe('when plan is trialing', () => {
      it('renders Pro button as "selected"', async () => {
        const { mockSetFormValue, mockSetSelectedPlan } = setup({
          planValue: Plans.USERS_TRIAL,
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            newPlan={trialPlan}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        expect(proBtn).toBeChecked()

        const teamBtn = await screen.findByTestId('radio-team')
        expect(teamBtn).toBeInTheDocument()
        expect(teamBtn).not.toBeChecked()
      })

      describe('user clicks Team button', () => {
        it('calls setValue and setSelectedPlan', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={trialPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(mockSetFormValue).toHaveBeenCalledWith(
              'newPlan',
              teamPlanYear
            )
          )
          await waitFor(() =>
            expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanYear)
          )
        })

        it('sets plan query param to team', async () => {
          const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
            planValue: Plans.USERS_TRIAL,
            hasSentryPlans: false,
            hasTeamPlans: true,
          })

          render(
            <PlanTypeOptions
              setFormValue={mockSetFormValue}
              setSelectedPlan={mockSetSelectedPlan}
              newPlan={trialPlan}
            />,
            {
              wrapper: wrapper(),
            }
          )

          const teamBtn = await screen.findByTestId('radio-team')
          expect(teamBtn).toBeInTheDocument()
          await user.click(teamBtn)

          await waitFor(() =>
            expect(testLocation.search).toEqual(
              qs.stringify({ plan: 'team' }, { addQueryPrefix: true })
            )
          )
        })
      })
    })
  })
  describe('when plan is monthly', () => {
    it('keeps monthly selection when changing plans', async () => {
      const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
        planValue: Plans.USERS_TEAMM,
        hasSentryPlans: false,
        hasTeamPlans: true,
      })

      render(
        <PlanTypeOptions
          setFormValue={mockSetFormValue}
          setSelectedPlan={mockSetSelectedPlan}
          newPlan={teamPlanMonth}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const proBtn = await screen.findByTestId('radio-team')
      expect(proBtn).toBeInTheDocument()
      await user.click(proBtn)

      await waitFor(() =>
        expect(mockSetFormValue).toHaveBeenCalledWith('newPlan', teamPlanMonth)
      )
      await waitFor(() =>
        expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanMonth)
      )
    })
  })
})
