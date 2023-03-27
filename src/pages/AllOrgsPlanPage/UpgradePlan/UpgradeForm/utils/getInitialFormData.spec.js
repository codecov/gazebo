import { Plans } from 'shared/utils/billing'

import { getInitialDataForm } from './getInitialFormData'

describe('getInitialDataForm', () => {
  const proPlanYear = { value: Plans.USERS_PR_INAPPY }
  const sentryPlanYear = { value: Plans.USERS_SENTRYY }

  describe('user cannot upgrade to sentry plan', () => {
    const isSentryUpgrade = false

    it('returns pro year plan if user is on a free plan', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_BASIC, quantity: 1 },
      }

      const data = getInitialDataForm({
        accountDetails,
        proPlanYear,
        sentryPlanYear,
        isSentryUpgrade,
        minSeats: 2,
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_PR_INAPPY,
        seats: 2,
      })
    })

    it('returns current plan if the user is on a paid plan', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_PR_INAPPM, quantity: 1 },
      }

      const data = getInitialDataForm({
        accountDetails,
        proPlanYear,
        sentryPlanYear,
        isSentryUpgrade,
        minSeats: 2,
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_PR_INAPPM,
        seats: 2,
      })
    })
  })

  describe('user can upgrade to sentry plan', () => {
    const isSentryUpgrade = true

    it('returns sentry year plan if user is on a free plan', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_BASIC, quantity: 1 },
      }

      const data = getInitialDataForm({
        accountDetails,
        proPlanYear,
        sentryPlanYear,
        isSentryUpgrade,
        minSeats: 2,
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_SENTRYY,
        seats: 2,
      })
    })

    it('returns current plan if the user is on a paid plan', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_PR_INAPPM, quantity: 1 },
      }

      const data = getInitialDataForm({
        accountDetails,
        proPlanYear,
        sentryPlanYear,
        isSentryUpgrade,
        minSeats: 2,
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_SENTRYY,
        seats: 2,
      })
    })
  })
})
