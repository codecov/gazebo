import { z } from 'zod'

import { AccountDetailsSchema } from 'services/account/useAccountDetails'
import { Plan, TrialStatuses } from 'services/account/usePlanData'
import { BillingRate, Plans } from 'shared/utils/billing'

import {
  calculatePrice,
  calculatePriceProPlan,
  calculatePriceTeamPlan,
  calculateSentryNonBundledCost,
  extractSeats,
  getDefaultValuesUpgradeForm,
  getSchema,
  shouldRenderCancelLink,
} from './upgradeForm'

describe('calculatePrice', () => {
  describe('isSentryUpgrade is true and isSelectedPlanTeam is false', () => {
    describe('seat count is at five', () => {
      it('returns base price', () => {
        const result = calculatePrice({
          seats: 5,
          baseUnitPrice: 10,
          isSentryUpgrade: true,
          sentryPrice: 29,
          isSelectedPlanTeam: false,
        })

        expect(result).toBe(29)
      })
    })

    describe('seat count is greater then five', () => {
      it('returns base price plus additional seats', () => {
        const result = calculatePrice({
          seats: 6,
          baseUnitPrice: 10,
          isSentryUpgrade: true,
          sentryPrice: 29,
          isSelectedPlanTeam: false,
        })

        expect(result).toBe(39)
      })
    })
  })

  describe('isSentryUpgrade is false', () => {
    describe('when isSelectedPlanTeam is false', () => {
      it('returns base price times amount of seats', () => {
        const result = calculatePrice({
          seats: 5,
          baseUnitPrice: 12,
          isSentryUpgrade: false,
          sentryPrice: 29,
          isSelectedPlanTeam: false,
        })

        expect(result).toBe(60)
      })
    })
    describe('when isSelectedPlanTeam is true', () => {
      it('returns base price times amount of seats', () => {
        const result = calculatePrice({
          seats: 5,
          baseUnitPrice: 12,
          isSentryUpgrade: false,
          sentryPrice: 29,
          isSelectedPlanTeam: true,
        })

        expect(result).toBe(60)
      })
    })
  })
})

describe('calculatePriceProPlan', () => {
  it('returns base price', () => {
    const result = calculatePriceProPlan({
      seats: 5,
      baseUnitPrice: 10,
    })

    expect(result).toBe(50)
  })
})

describe('calculatePriceTeamPlan', () => {
  it('returns base price', () => {
    const result = calculatePriceTeamPlan({
      seats: 5,
      baseUnitPrice: 10,
    })

    expect(result).toBe(50)
  })
})

describe('getDefaultValuesUpgradeForm', () => {
  const accountDetails = {} as z.infer<typeof AccountDetailsSchema>
  const proPlanYear = { value: Plans.USERS_PR_INAPPY } as Plan
  const proPlanMonth = { value: Plans.USERS_PR_INAPPM } as Plan
  const sentryPlanYear = { value: Plans.USERS_SENTRYY } as Plan
  const sentryPlanMonth = { value: Plans.USERS_SENTRYM } as Plan
  const teamPlanMonth = { value: Plans.USERS_TEAMM } as Plan

  describe('when selectedPlan is provided', () => {
    it('returns selectedPlan directly', () => {
      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        selectedPlan: proPlanYear,
        plans: [proPlanYear, proPlanMonth],
        plan: {
          billingRate: BillingRate.MONTHLY,
          value: Plans.USERS_PR_INAPPM,
          planUserCount: 1,
        } as Plan,
      })

      expect(data).toStrictEqual({
        newPlan: { value: Plans.USERS_PR_INAPPY },
        seats: 2,
      })
    })
  })

  describe('when selectedPlan is not provided', () => {
    describe('and user is sentry upgrade', () => {
      it('returns sentry year plan for yearly billing', () => {
        const data = getDefaultValuesUpgradeForm({
          accountDetails,
          plans: [proPlanYear, proPlanMonth, sentryPlanYear, sentryPlanMonth],
          plan: {
            billingRate: BillingRate.ANNUALLY,
            value: Plans.USERS_PR_INAPPY,
            planUserCount: 1,
          } as Plan,
        })

        expect(data).toStrictEqual({
          newPlan: { value: Plans.USERS_SENTRYY },
          seats: 5,
        })
      })

      it('returns sentry month plan for monthly billing', () => {
        const data = getDefaultValuesUpgradeForm({
          accountDetails,
          plans: [proPlanYear, proPlanMonth, sentryPlanYear, sentryPlanMonth],
          plan: {
            billingRate: BillingRate.MONTHLY,
            value: Plans.USERS_PR_INAPPM,
            planUserCount: 1,
          } as Plan,
        })

        expect(data).toStrictEqual({
          newPlan: { value: Plans.USERS_SENTRYM },
          seats: 5,
        })
      })
    })

    describe('and current plan is team', () => {
      it('returns team monthly plan for monthly billing', () => {
        const data = getDefaultValuesUpgradeForm({
          accountDetails,
          plans: [teamPlanMonth],
          plan: {
            billingRate: BillingRate.MONTHLY,
            value: Plans.USERS_TEAMM,
            planUserCount: 1,
            isTeamPlan: true,
          } as Plan,
        })

        expect(data).toStrictEqual({
          newPlan: { value: Plans.USERS_TEAMM },
          seats: 2,
        })
      })

      it('returns correct seats when free seats are present', () => {
        const data = getDefaultValuesUpgradeForm({
          accountDetails,
          plans: [teamPlanMonth],
          plan: {
            billingRate: BillingRate.MONTHLY,
            value: Plans.USERS_TEAMM,
            planUserCount: 5,
            freeSeatCount: 2,
            isTeamPlan: true,
          } as Plan,
        })

        expect(data).toStrictEqual({
          newPlan: { value: Plans.USERS_TEAMM },
          seats: 3,
        })
      })
    })

    describe('and current plan is sentry', () => {
      it('returns current sentry plan', () => {
        const data = getDefaultValuesUpgradeForm({
          accountDetails,
          plans: [proPlanYear, sentryPlanYear],
          plan: {
            billingRate: BillingRate.MONTHLY,
            value: Plans.USERS_SENTRYY,
            planUserCount: 1,
            isTeamPlan: false,
            isSentryPlan: true,
          } as Plan,
        })

        expect(data).toStrictEqual({
          newPlan: {
            billingRate: BillingRate.MONTHLY,
            value: Plans.USERS_SENTRYY,
            planUserCount: 1,
            isTeamPlan: false,
            isSentryPlan: true,
          },
          seats: 5,
        })
      })
    })

    describe('and user is on a paid pro plan', () => {
      it('returns current plan', () => {
        const data = getDefaultValuesUpgradeForm({
          accountDetails,
          plans: [proPlanYear, proPlanMonth],
          plan: {
            billingRate: BillingRate.MONTHLY,
            value: Plans.USERS_PR_INAPPM,
            planUserCount: 2,
          } as Plan,
        })

        expect(data).toStrictEqual({
          newPlan: {
            value: Plans.USERS_PR_INAPPM,
            billingRate: BillingRate.MONTHLY,
            planUserCount: 2,
          },
          seats: 2,
        })
      })
    })
  })

  describe('quantity calculation edge cases', () => {
    it('handles case where freeSeatCount equals planUserCount', () => {
      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        plans: [proPlanYear, proPlanMonth],
        plan: {
          billingRate: BillingRate.MONTHLY,
          value: Plans.USERS_PR_INAPPM,
          planUserCount: 3,
          freeSeatCount: 3,
        } as Plan,
      })

      expect(data).toStrictEqual({
        newPlan: {
          value: Plans.USERS_PR_INAPPM,
          billingRate: BillingRate.MONTHLY,
          planUserCount: 3,
          freeSeatCount: 3,
        },
        // extractSeats() will be passed quantity: 0, but returns min plan seats
        seats: 2,
      })
    })
  })
})

describe('getSchema', () => {
  const accountDetails = {
    activatedUserCount: 2,
  } as z.infer<typeof AccountDetailsSchema>

  it('passes parsing when all conditions are met', () => {
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({
      seats: 10,
      newPlan: { value: Plans.USERS_PR_INAPPY },
    })
    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })

  it('fails to parse when newPlan is not a string', () => {
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 5, newPlan: { value: 5 } })
    expect(response.success).toEqual(false)

    const [issue] = response.error!.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Expected string, received number',
      })
    )
  })

  it('fails to parse when seats is not a number', () => {
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 'ahh' })
    expect(response.success).toEqual(false)

    const [issue] = response.error!.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Seats is required to be a number',
      })
    )
  })

  it('fails to parse when the seats are below the minimum', () => {
    const schema = getSchema({ accountDetails, minSeats: 5 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toEqual(false)

    const [issue] = response.error!.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'You cannot purchase a per user plan for less than 5 users',
      })
    )
  })

  it('fails to parse when seats are below activated seats', () => {
    const accountDetails = {
      activatedUserCount: 5,
    } as z.infer<typeof AccountDetailsSchema>
    const schema = getSchema({ accountDetails, minSeats: 1 })

    const response = schema.safeParse({ seats: 3 })
    expect(response.success).toBe(false)

    const [issue] = response.error!.issues
    expect(issue).toEqual(
      expect.objectContaining({
        message: 'Must deactivate more users before downgrading plans',
      })
    )
  })

  it('passes when seats are below activated seats and user is on trial', () => {
    const schema = getSchema({
      accountDetails,
      minSeats: 5,
      trialStatus: TrialStatuses.ONGOING,
    })

    const response = schema.safeParse({
      seats: 10,
      newPlan: { value: Plans.USERS_PR_INAPPY },
    })
    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })

  describe('when the user upgrades to team plan', () => {
    const accountDetails = {} as z.infer<typeof AccountDetailsSchema>

    it('fails to parse when seats are above max seats', () => {
      const schema = getSchema({
        accountDetails,
        selectedPlan: {
          value: Plans.USERS_TEAMY,
          isTeamPlan: true,
          isTrialPlan: false,
        } as Plan,
      })

      const response = schema.safeParse({
        seats: 12,
        newPlan: Plans.USERS_TEAMY,
      })
      expect(response.success).toBe(false)

      const [issue] = response.error!.issues
      expect(issue).toEqual(
        expect.objectContaining({
          message: 'Team plan is only available for 10 paid seats or fewer.',
        })
      )
    })

    it('passes when seats are below max seats for team yearly plan', () => {
      const schema = getSchema({
        accountDetails,
        selectedPlan: {
          value: Plans.USERS_TEAMY,
        } as Plan,
      })

      const response = schema.safeParse({
        seats: 9,
        newPlan: { value: Plans.USERS_TEAMY },
      })

      expect(response.success).toEqual(true)
      expect(response.error).toBeUndefined()
    })
  })

  it('passes when seats are below max seats for team monthly plan', () => {
    const schema = getSchema({
      accountDetails,
      selectedPlan: {
        value: Plans.USERS_TEAMM,
      } as Plan,
    })

    const response = schema.safeParse({
      seats: 9,
      newPlan: { value: Plans.USERS_TEAMM },
    })

    expect(response.success).toEqual(true)
    expect(response.error).toBeUndefined()
  })
})

describe('calculateSentryNonBundledCost', () => {
  it('returns calculated cost', () => {
    const total = calculateSentryNonBundledCost({ baseUnitPrice: 10 })
    expect(total).toEqual(252)
  })
})

describe('extractSeats', () => {
  describe('user on free plan and can upgrade to sentry plan', () => {
    it('returns min seats when members are less than min', () => {
      const seats = extractSeats({
        quantity: 1,
        isSentryUpgrade: true,
        activatedUserCount: 0,
        inactiveUserCount: 0,
        isFreePlan: true,
        isTrialPlan: false,
      })
      expect(seats).toEqual(5)
    })

    it('returns members number as seats when members are greater than min', () => {
      const seats = extractSeats({
        quantity: 1,
        isSentryUpgrade: true,
        activatedUserCount: 10,
        inactiveUserCount: 2,
        isFreePlan: true,
        isTrialPlan: false,
      })
      expect(seats).toEqual(12)
    })
  })

  describe('user on free plan and can not upgrade to sentry plan', () => {
    it('returns min seats when members are less than min', () => {
      const seats = extractSeats({
        quantity: 1,
        isSentryUpgrade: false,
        activatedUserCount: 0,
        inactiveUserCount: 0,
        isFreePlan: true,
        isTrialPlan: false,
      })
      expect(seats).toEqual(2)
    })

    it('returns members number as seats when members are greater than min', () => {
      const seats = extractSeats({
        quantity: 1,
        activatedUserCount: 10,
        inactiveUserCount: 2,
        isSentryUpgrade: false,
        isFreePlan: true,
        isTrialPlan: false,
      })
      expect(seats).toEqual(12)
    })
  })

  describe('user on paid plan', () => {
    it('returns members number as seats', () => {
      const seats = extractSeats({
        quantity: 8,
        activatedUserCount: 12,
        inactiveUserCount: 0,
        isSentryUpgrade: false,
        isFreePlan: false,
        isTrialPlan: false,
      })
      expect(seats).toEqual(8)
    })
  })

  describe('user on sentry plan', () => {
    it('returns members number as seats', () => {
      const seats = extractSeats({
        quantity: 8,
        activatedUserCount: 12,
        inactiveUserCount: 0,
        isSentryUpgrade: false,
        isFreePlan: false,
        isTrialPlan: false,
      })
      expect(seats).toEqual(8)
    })
  })

  describe('user on paid plan and can upgrade to sentry plan', () => {
    it('returns members number as seats if greater than min', () => {
      const seats = extractSeats({
        quantity: 8,
        activatedUserCount: 12,
        inactiveUserCount: 0,
        isSentryUpgrade: true,
        isFreePlan: false,
        isTrialPlan: false,
      })
      expect(seats).toEqual(8)
    })

    it('returns min seats if less than min', () => {
      const seats = extractSeats({
        quantity: 2,
        isSentryUpgrade: true,
        isFreePlan: false,
        isTrialPlan: false,
      })
      expect(seats).toEqual(5)
    })
  })

  describe('user on trial plan plan', () => {
    describe('user has access to sentry upgrade', () => {
      it('returns sentry plan base seat count as seats', () => {
        const seats = extractSeats({
          quantity: 8,
          activatedUserCount: 12,
          inactiveUserCount: 0,
          isSentryUpgrade: true,
          trialStatus: TrialStatuses.ONGOING,
          isFreePlan: false,
          isTrialPlan: true,
        })

        expect(seats).toEqual(5)
      })
    })

    describe('user does not have access to sentry upgrade', () => {
      it('returns pro plan base seat count as seats', () => {
        const seats = extractSeats({
          quantity: 8,
          activatedUserCount: 12,
          inactiveUserCount: 0,
          isSentryUpgrade: false,
          trialStatus: TrialStatuses.ONGOING,
          isFreePlan: false,
          isTrialPlan: true,
        })

        expect(seats).toEqual(2)
      })
    })
  })
})

describe('shouldRenderCancelLink', () => {
  it('returns true', () => {
    // eslint-disable-next-line testing-library/render-result-naming-convention
    const value = shouldRenderCancelLink({
      cancelAtPeriodEnd: false,
      plan: { isFreePlan: false, isTrialPlan: false } as Plan,
      trialStatus: TrialStatuses.NOT_STARTED,
    })

    expect(value).toBeTruthy()
  })

  describe('user is on a free plan', () => {
    it('returns false', () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const cancelLinkResult = shouldRenderCancelLink({
        cancelAtPeriodEnd: false,
        plan: { isFreePlan: true, isTrialPlan: false } as Plan,
        trialStatus: TrialStatuses.NOT_STARTED,
      })

      expect(cancelLinkResult).toBeFalsy()
    })
  })

  describe('user is currently on a trial', () => {
    it('returns false', () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const cancelLinkResult = shouldRenderCancelLink({
        cancelAtPeriodEnd: false,
        plan: { isFreePlan: false, isTrialPlan: true } as Plan,
        trialStatus: TrialStatuses.ONGOING,
      })

      expect(cancelLinkResult).toBeFalsy()
    })
  })

  describe('user has already cancelled their plan', () => {
    it('returns false', () => {
      // eslint-disable-next-line testing-library/render-result-naming-convention
      const cancelLinkResult = shouldRenderCancelLink({
        cancelAtPeriodEnd: true,
        plan: { value: Plans.USERS_PR_INAPPY, isFreePlan: false } as Plan,
        trialStatus: TrialStatuses.NOT_STARTED,
      })

      expect(cancelLinkResult).toBeFalsy()
    })
  })

  describe('user intended plan is Team', () => {
    it('sets new plan to team', () => {
      const accountDetails = {} as z.infer<typeof AccountDetailsSchema>
      const plans = [
        { value: Plans.USERS_TEAMY } as Plan,
        { value: Plans.USERS_PR_INAPPY } as Plan,
      ]

      const data = getDefaultValuesUpgradeForm({
        accountDetails,
        plans,
        selectedPlan: { value: Plans.USERS_TEAMY } as Plan,
        plan: {
          billingRate: BillingRate.ANNUALLY,
          value: Plans.USERS_TEAMY,
          planUserCount: 1,
          isTeamPlan: true,
          isSentryPlan: false,
        } as Plan,
      })

      expect(data).toStrictEqual({
        newPlan: { value: Plans.USERS_TEAMY },
        seats: 2,
      })
    })
  })
})
