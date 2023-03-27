import { Plans } from 'shared/utils/billing'

import { getInitialDataForm, getSchema } from './upgradeForm'

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

    it('returns current sentry plan if user is on monthly', () => {
      const accountDetails = {
        plan: { value: Plans.USERS_SENTRYM, quantity: 1 },
      }

      const data = getInitialDataForm({
        accountDetails,
        proPlanYear,
        sentryPlanYear,
        isSentryUpgrade,
        minSeats: 2,
      })

      expect(data).toStrictEqual({
        newPlan: Plans.USERS_SENTRYM,
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

describe('getSchema', () => {
  it('passes parsing when all conditions are met', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 10 })
    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })

  it('fails to parse when seats is not a number', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 'ahh' })
    expect(response.success).toEqual(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Seats is required to be a number',
      })
    )
  })

  it('fails to parse when the seats are below the minimum', () => {
    const accountDetails = {
      activatedUserCount: 2,
    }
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toEqual(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'You cannot purchase a per user plan for less than 5 users',
      })
    )
  })

  it('fails to parse when seats are below activated seats', () => {
    const accountDetails = {
      activatedUserCount: 5,
    }
    const schema = getSchema({ accountDetails, minSeats: 1 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toBe(false)

    const [issue] = response.error.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Must deactivate more users before downgrading plans',
      })
    )
  })
})
