import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'
import { MemoryRouter, Route } from 'react-router-dom'

import { TrialStatuses } from 'services/account'
import { Plans } from 'shared/utils/billing'

import UpdateBlurb from './UpdateBlurb'

const planChunk = {
  trialStatus: TrialStatuses.NOT_STARTED,
  trialStartDate: '',
  trialEndDate: '',
  trialTotalDays: 0,
  pretrialUsersCount: 0,
  planUserCount: 2,
  isEnterprisePlan: false,
  isFreePlan: false,
  hasSeatsLeft: true,
}

const proPlanYear = {
  marketingName: 'Pro',
  value: Plans.USERS_PR_INAPPY,
  billingRate: 'annually',
  baseUnitPrice: 10,
  benefits: [
    'Configurable # of users',
    'Unlimited public repositories',
    'Unlimited private repositories',
    'Priority Support',
  ],
  monthlyUploadLimit: null,
}

const teamPlanYear = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'annually',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMY,
}

const teamPlanMonth = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_TEAMM,
}

const freePlan = {
  baseUnitPrice: 5,
  benefits: ['Up to 10 users'],
  billingRate: 'monthly',
  marketingName: 'Users Team',
  monthlyUploadLimit: 2500,
  value: Plans.USERS_BASIC,
}

type WrapperClosure = (
  initialEntries?: string[]
) => React.FC<React.PropsWithChildren>
const wrapper: WrapperClosure =
  (initialEntries = ['/plan/gh/codecov/upgrade']) =>
  ({ children }) => (
    <MemoryRouter initialEntries={initialEntries}>
      <Route path="/plan/:provider/:owner/upgrade">
        <Suspense fallback={<p>Loading...</p>}>{children}</Suspense>
      </Route>
    </MemoryRouter>
  )

describe('UpdateBlurb', () => {
  describe('no diff', () => {
    it('does not render anything', async () => {
      render(
        <UpdateBlurb
          currentPlan={{ ...teamPlanMonth, ...planChunk, planUserCount: 10 }}
          selectedPlan={{ ...teamPlanMonth, quantity: 10 }}
          newPlanName={teamPlanMonth.value}
          nextBillingDate={'July 12th, 2024'}
          seats={10}
        />,
        {
          wrapper: wrapper(),
        }
      )

      const headingBlurb = screen.queryByText('Review your plan changes')
      expect(headingBlurb).not.toBeInTheDocument()
    })
  })
  describe('upgrades', () => {
    describe('when user has free plan', () => {
      it('renders immediate update blurb', async () => {
        render(
          <UpdateBlurb
            currentPlan={{ ...freePlan, ...planChunk, isFreePlan: true }}
            selectedPlan={{ ...teamPlanYear, quantity: 10 }}
            newPlanName={teamPlanYear.value}
            nextBillingDate={'July 12th, 2024'}
            seats={10}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const planBlurb = await screen.findByText(
          'You are changing from the Developer plan to the [Team plan]'
        )
        const seatsBlurb = await screen.findByText(
          'You are changing seats from 2 to [10]'
        )
        const billingBlurb = screen.queryByText(
          'You are changing your billing cycle from Monthly to [Annual]'
        )
        const immediateUpdate = await screen.findByText(
          /Your changes will take effect immediately./
        )
        expect(planBlurb).toBeInTheDocument()
        expect(seatsBlurb).toBeInTheDocument()
        expect(billingBlurb).not.toBeInTheDocument()
        expect(immediateUpdate).toBeInTheDocument()
      })
    })

    describe('when user has monthly -> yearly plan', () => {
      it('renders immediate update blurb', async () => {
        render(
          <UpdateBlurb
            currentPlan={{ ...teamPlanMonth, ...planChunk, planUserCount: 10 }}
            selectedPlan={{ ...teamPlanYear, quantity: 10 }}
            newPlanName={teamPlanYear.value}
            nextBillingDate={'July 12th, 2024'}
            seats={10}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const billingBlurb = await screen.findByText(
          'You are changing your billing cycle from Monthly to [Annual]'
        )
        const immediateUpdate = await screen.findByText(
          /Your changes will take effect immediately./
        )
        expect(billingBlurb).toBeInTheDocument()
        expect(immediateUpdate).toBeInTheDocument()
      })
    })

    describe('when user has increase in seats', () => {
      it('renders immediate update blurb', async () => {
        render(
          <UpdateBlurb
            currentPlan={{ ...proPlanYear, ...planChunk, planUserCount: 10 }}
            selectedPlan={{ ...proPlanYear, quantity: 10 }}
            newPlanName={proPlanYear.value}
            nextBillingDate={'July 12th, 2024'}
            seats={11}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const seatsBlurb = await screen.findByText(
          'You are changing seats from 10 to [11]'
        )
        const immediateUpdate = await screen.findByText(
          /Your changes will take effect immediately./
        )
        expect(seatsBlurb).toBeInTheDocument()
        expect(immediateUpdate).toBeInTheDocument()
      })
    })

    describe('when user has change from team to pro', () => {
      it('renders immediate update blurb', async () => {
        render(
          <UpdateBlurb
            currentPlan={{ ...teamPlanYear, ...planChunk, planUserCount: 10 }}
            selectedPlan={{ ...proPlanYear, quantity: 10 }}
            newPlanName={proPlanYear.value}
            nextBillingDate={'July 12th, 2024'}
            seats={10}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const proBlurb = await screen.findByText(
          'You are changing from the Team plan to the [Pro plan]'
        )
        const immediateUpdate = await screen.findByText(
          /Your changes will take effect immediately./
        )
        expect(proBlurb).toBeInTheDocument()
        expect(immediateUpdate).toBeInTheDocument()
      })
    })
  })
  describe('downgrades', () => {
    describe('when user change from annual to monthly', () => {
      it('renders next billing cycle blurb', async () => {
        render(
          <UpdateBlurb
            currentPlan={{ ...teamPlanYear, ...planChunk, planUserCount: 10 }}
            selectedPlan={{ ...teamPlanMonth, quantity: 10 }}
            newPlanName={teamPlanMonth.value}
            nextBillingDate={'July 12th, 2024'}
            seats={10}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const billingBlurb = await screen.findByText(
          'You are changing your billing cycle from Annual to [Monthly]'
        )
        const nextCycleUpdate = await screen.findByText(
          'Your changes will take effect at the beginning of your next billing cycle on [July 12th, 2024].'
        )
        expect(billingBlurb).toBeInTheDocument()
        expect(nextCycleUpdate).toBeInTheDocument()
      })
    })

    describe('when user has decrease in seats', () => {
      it('renders next billing cycle blurb', async () => {
        render(
          <UpdateBlurb
            currentPlan={{ ...teamPlanYear, ...planChunk, planUserCount: 10 }}
            selectedPlan={{ ...teamPlanYear, quantity: 9 }}
            newPlanName={teamPlanYear.value}
            nextBillingDate={'July 12th, 2024'}
            seats={9}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const seatsBlurb = await screen.findByText(
          'You are changing seats from 10 to [9]'
        )
        const nextCycleUpdate = await screen.findByText(
          'Your changes will take effect at the beginning of your next billing cycle on [July 12th, 2024].'
        )
        expect(seatsBlurb).toBeInTheDocument()
        expect(nextCycleUpdate).toBeInTheDocument()
      })
    })

    describe('when user has change from pro to team', () => {
      it('renders next billing cycle blurb', async () => {
        render(
          <UpdateBlurb
            currentPlan={{ ...proPlanYear, ...planChunk, planUserCount: 10 }}
            selectedPlan={{ ...teamPlanYear, quantity: 10 }}
            newPlanName={teamPlanYear.value}
            nextBillingDate={'July 12th, 2024'}
            seats={10}
          />,
          {
            wrapper: wrapper(),
          }
        )

        const teamBlurb = await screen.findByText(
          'You are changing from the Pro plan to the [Team plan]'
        )
        const nextCycleUpdate = await screen.findByText(
          'Your changes will take effect at the beginning of your next billing cycle on [July 12th, 2024].'
        )
        expect(teamBlurb).toBeInTheDocument()
        expect(nextCycleUpdate).toBeInTheDocument()
      })
    })
  })
})
