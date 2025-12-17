import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import qs from 'qs'
import { Suspense } from 'react'
import { MemoryRouter, Route, useLocation } from 'react-router-dom'

import { BillingRate, Plans } from 'shared/utils/billing'

import PlanTypeOptions from './PlanTypeOptions'

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
  benefits: ['Up to 10 paid users'],
  billingRate: BillingRate.MONTHLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
  isTeamPlan: true,
  isSentryPlan: false,
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 paid users'],
  billingRate: BillingRate.ANNUALLY,
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
  isTeamPlan: true,
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
  hasSentryPlans?: boolean
  hasTeamPlans?: boolean
}

describe('PlanTypeOptions', () => {
  function setup({
    hasSentryPlans = false,
    hasTeamPlans = true,
  }: Partial<SetupArgs> = {}) {
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
        return HttpResponse.json({
          data: {
            owner: {
              hasPrivateRepos: true,
              plan: {
                ...proPlanMonth,
                trialStatus: 'NOT_STARTED',
                trialStartDate: '',
                trialEndDate: '',
                trialTotalDays: 0,
                pretrialUsersCount: 0,
                planUserCount: 1,
                freeSeatCount: 0,
                hasSeatsLeft: true,
                isEnterprisePlan: false,
                isFreePlan: false,
                isProPlan: true,
                isSentryPlan: false,
                isTeamPlan: false,
                isTrialPlan: false,
              },
              pretrialPlan: null,
            },
          },
        })
      })
    )

    const mockSetFormValue = vi.fn()
    const mockSetSelectedPlan = vi.fn()
    const user = userEvent.setup()

    return { user, mockSetFormValue, mockSetSelectedPlan }
  }

  describe('when selectedPlan is Pro', () => {
    it('renders Pro button as checked', async () => {
      const { mockSetFormValue, mockSetSelectedPlan } = setup({
        hasSentryPlans: false,
        hasTeamPlans: true,
      })

      render(
        <PlanTypeOptions
          setFormValue={mockSetFormValue}
          setSelectedPlan={mockSetSelectedPlan}
          selectedPlan={proPlanMonth}
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
  })

  describe('when selectedPlan is Sentry', () => {
    it('renders Pro button as checked', async () => {
      const { mockSetFormValue, mockSetSelectedPlan } = setup({
        hasSentryPlans: true,
        hasTeamPlans: true,
      })

      render(
        <PlanTypeOptions
          setFormValue={mockSetFormValue}
          setSelectedPlan={mockSetSelectedPlan}
          selectedPlan={sentryPlanMonth}
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
  })

  describe('when selectedPlan is Team', () => {
    it('renders Team button as checked', async () => {
      const { mockSetFormValue, mockSetSelectedPlan } = setup({
        hasSentryPlans: false,
        hasTeamPlans: true,
      })

      render(
        <PlanTypeOptions
          setFormValue={mockSetFormValue}
          setSelectedPlan={mockSetSelectedPlan}
          selectedPlan={teamPlanMonth}
        />,
        {
          wrapper: wrapper(),
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

  describe('user interactions', () => {
    describe('clicking Pro button', () => {
      it('calls setValue and setSelectedPlan with Pro plan', async () => {
        const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            selectedPlan={teamPlanMonth}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        await user.click(proBtn)

        await waitFor(() =>
          expect(mockSetFormValue).toHaveBeenCalledWith('newPlan', proPlanMonth)
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toHaveBeenCalledWith(proPlanMonth)
        )
      })

      it('sets plan query param to pro', async () => {
        const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            selectedPlan={teamPlanMonth}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        await user.click(proBtn)

        await waitFor(() =>
          expect(testLocation.search).toEqual(
            qs.stringify({ plan: 'pro' }, { addQueryPrefix: true })
          )
        )
      })
    })

    describe('clicking Team button', () => {
      it('calls setValue and setSelectedPlan with Team plan', async () => {
        const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            selectedPlan={proPlanMonth}
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
            teamPlanMonth
          )
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toHaveBeenCalledWith(teamPlanMonth)
        )
      })

      it('sets plan query param to team', async () => {
        const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: false,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            selectedPlan={proPlanMonth}
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

    describe('with Sentry upgrade', () => {
      it('calls setValue and setSelectedPlan with Sentry plan when clicking Pro', async () => {
        const { user, mockSetFormValue, mockSetSelectedPlan } = setup({
          hasSentryPlans: true,
          hasTeamPlans: true,
        })

        render(
          <PlanTypeOptions
            setFormValue={mockSetFormValue}
            setSelectedPlan={mockSetSelectedPlan}
            selectedPlan={teamPlanMonth}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBtn = await screen.findByTestId('radio-pro')
        expect(proBtn).toBeInTheDocument()
        await user.click(proBtn)

        await waitFor(() =>
          expect(mockSetFormValue).toHaveBeenCalledWith(
            'newPlan',
            sentryPlanMonth
          )
        )
        await waitFor(() =>
          expect(mockSetSelectedPlan).toHaveBeenCalledWith(sentryPlanMonth)
        )
      })
    })
  })
})
