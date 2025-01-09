import { IndividualPlan } from 'services/account'

import {
  BillingRate,
  canApplySentryUpgrade,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  formatNumberToUSD,
  formatTimestampToCalendarDate,
  getNextBillingDate,
  lastTwoDigits,
  Plans,
  shouldDisplayTeamCard,
} from './billing'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', async () => {
  const actual = await vi.importActual('shared/featureFlags')
  return {
    ...actual,
    useFlags: mocks.useFlags,
  }
})

function getPlans() {
  return [
    {
      marketingName: 'Basic',
      value: Plans.USERS_FREE,
      billingRate: null,
      baseUnitPrice: 0,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 5 users',
        'Unlimited public repositories',
        'Unlimited private repositories',
      ],
      isSentryPlan: false,
      isTeamPlan: false,
    },
    {
      marketingName: 'Pro',
      value: Plans.USERS_PR_INAPPM,
      billingRate: BillingRate.MONTHLY,
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
      isSentryPlan: false,
      isTeamPlan: false,
    },
    {
      marketingName: 'Pro',
      value: Plans.USERS_PR_INAPPY,
      billingRate: BillingRate.ANNUALLY,
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
      isSentryPlan: false,
      isTeamPlan: false,
    },
    {
      marketingName: 'Enterprise',
      value: Plans.USERS_ENTERPRISEM,
      billingRate: BillingRate.MONTHLY,
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
      isSentryPlan: false,
      isTeamPlan: false,
    },
    {
      marketingName: 'Pro Team',
      value: Plans.USERS_ENTERPRISEY,
      billingRate: BillingRate.ANNUALLY,
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
      isSentryPlan: false,
      isTeamPlan: false,
    },
    {
      marketingName: 'Sentry Pro Team',
      value: Plans.USERS_SENTRYM,
      billingRate: BillingRate.MONTHLY,
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialTotalDays: 14,
      isSentryPlan: true,
      isTeamPlan: false,
    },
    {
      marketingName: 'Sentry Pro Team',
      value: Plans.USERS_SENTRYY,
      billingRate: BillingRate.ANNUALLY,
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialTotalDays: 14,
      isSentryPlan: true,
      isTeamPlan: false,
    },
    {
      marketingName: 'Team',
      value: Plans.USERS_TEAMM,
      billingRate: BillingRate.MONTHLY,
      baseUnitPrice: 6,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialTotalDays: null,
      isSentryPlan: false,
      isTeamPlan: true,
    },
    {
      marketingName: 'Team',
      value: Plans.USERS_TEAMY,
      billingRate: BillingRate.ANNUALLY,
      baseUnitPrice: 5,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialTotalDays: null,
      isSentryPlan: false,
      isTeamPlan: true,
    },
  ]
}

describe('shouldDisplayTeamCard', () => {
  it('returns true if the availablePlans list includes team plans', () => {
    const plans = getPlans()
    expect(shouldDisplayTeamCard({ plans })).toBe(true)
  })

  it('returns false if the availablePlans list does not include team plans', () => {
    const plans = [
      {
        marketingName: 'Pro Team',
        value: Plans.USERS_PR_INAPPM,
        billingRate: BillingRate.MONTHLY,
        baseUnitPrice: 12,
        monthlyUploadLimit: null,
        benefits: [
          'Configureable # of users',
          'Unlimited public repositories',
          'Unlimited private repositories',
          'Priorty Support',
        ],
        isSentryPlan: false,
        isTeamPlan: false,
      },
      {
        marketingName: 'Pro Team',
        value: Plans.USERS_PR_INAPPY,
        billingRate: BillingRate.ANNUALLY,
        baseUnitPrice: 10,
        monthlyUploadLimit: null,
        benefits: [
          'Configureable # of users',
          'Unlimited public repositories',
          'Unlimited private repositories',
          'Priorty Support',
        ],
        isSentryPlan: false,
        isTeamPlan: false,
      },
    ]
    expect(shouldDisplayTeamCard({ plans })).toBe(false)
  })
})

describe('formatNumberToUSD', () => {
  it('formats number into currency string', () => {
    const value = formatNumberToUSD(10_000)

    expect(value).toBe('$10,000.00')
  })
})

describe('formatTimestampToCalendarDate', () => {
  it('formats into calendar date', () => {
    const value = formatTimestampToCalendarDate(1660000000)

    expect(value).toBe('August 8, 2022')
  })

  it('return null when null', () => {
    const value = formatTimestampToCalendarDate(null)

    expect(value).toBe(null)
  })
})

describe('lastTwoDigits', () => {
  it('gets the last two digits if not null', () => {
    const value = lastTwoDigits(2341)

    expect(value).toBe('41')
  })

  it('return null when null', () => {
    // @ts-expect-error - testing with a null
    const value = lastTwoDigits(null)

    expect(value).toBe(null)
  })
})

describe('getNextBillingDate', () => {
  describe('there is a valid timestamp', () => {
    it('returns formatted timestamp', () => {
      const value = getNextBillingDate({
        subscriptionDetail: {
          // @ts-expect-error - we're just testing this property we can ignore the other properties
          latestInvoice: {
            periodEnd: 1660000000,
          },
        },
      })

      expect(value).toBe('August 8th, 2022')
    })
  })

  describe('there is no timestamp', () => {
    it('returns null', () => {
      // @ts-expect-error - testing when there are no properties
      const value = getNextBillingDate({})

      expect(value).toBeNull()
    })
  })
})

describe('findSentryPlans', () => {
  it('contains monthly plan', () => {
    const plans = getPlans()
    const { sentryPlanMonth } = findSentryPlans({ plans })

    const expectedResult = {
      marketingName: 'Sentry Pro Team',
      value: Plans.USERS_SENTRYM,
      billingRate: BillingRate.MONTHLY,
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialTotalDays: 14,
      isSentryPlan: true,
      isTeamPlan: false,
    }

    expect(sentryPlanMonth).toStrictEqual(expectedResult)
  })

  it('contains annual plan', () => {
    const plans = getPlans()
    const { sentryPlanYear } = findSentryPlans({ plans })

    const expectedResult = {
      marketingName: 'Sentry Pro Team',
      value: Plans.USERS_SENTRYY,
      billingRate: BillingRate.ANNUALLY,
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialTotalDays: 14,
      isSentryPlan: true,
      isTeamPlan: false,
    }

    expect(sentryPlanYear).toStrictEqual(expectedResult)
  })
})

describe('findProPlans', () => {
  it('contains monthly plan', () => {
    const plans = getPlans()
    const { proPlanMonth } = findProPlans({ plans })

    const expectedResult = {
      marketingName: 'Pro',
      value: Plans.USERS_PR_INAPPM,
      billingRate: BillingRate.MONTHLY,
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
      isSentryPlan: false,
      isTeamPlan: false,
    }

    expect(proPlanMonth).toStrictEqual(expectedResult)
  })

  it('contains annual plan', () => {
    const plans = getPlans()
    const { proPlanYear } = findProPlans({ plans })

    const expectedResult = {
      marketingName: 'Pro',
      value: Plans.USERS_PR_INAPPY,
      billingRate: BillingRate.ANNUALLY,
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
      isSentryPlan: false,
      isTeamPlan: false,
    }

    expect(proPlanYear).toStrictEqual(expectedResult)
  })
})

describe('findTeamPlans', () => {
  it('contains monthly plan', () => {
    const plans = getPlans()
    const { teamPlanMonth } = findTeamPlans({ plans })

    const expectedResult = {
      marketingName: 'Team',
      value: Plans.USERS_TEAMM,
      billingRate: BillingRate.MONTHLY,
      baseUnitPrice: 6,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialTotalDays: null,
      isSentryPlan: false,
      isTeamPlan: true,
    }

    expect(teamPlanMonth).toStrictEqual(expectedResult)
  })

  it('contains annual plan', () => {
    const plans = getPlans()
    const { teamPlanYear } = findTeamPlans({ plans })

    const expectedResult = {
      marketingName: 'Team',
      value: Plans.USERS_TEAMY,
      billingRate: BillingRate.ANNUALLY,
      baseUnitPrice: 5,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialTotalDays: null,
      isSentryPlan: false,
      isTeamPlan: true,
    }

    expect(teamPlanYear).toStrictEqual(expectedResult)
  })
})

describe('canApplySentryUpgrade', () => {
  it('returns true when list contains monthly plan', () => {
    const result = canApplySentryUpgrade({
      isEnterprisePlan: false,
      plans: [
        { value: Plans.USERS_SENTRYM, isSentryPlan: true },
      ] as IndividualPlan[],
    })

    expect(result).toBeTruthy()
  })

  it('returns true when list contains annual plan', () => {
    const result = canApplySentryUpgrade({
      isEnterprisePlan: false,
      plans: [
        { value: Plans.USERS_SENTRYY, isSentryPlan: true },
      ] as IndividualPlan[],
    })

    expect(result).toBeTruthy()
  })

  it('returns false when plans are not in list', () => {
    const result = canApplySentryUpgrade({
      plans: [
        { value: Plans.USERS_FREE, isSentryPlan: false },
      ] as IndividualPlan[],
    })

    expect(result).toBeFalsy()
  })

  it('returns false when user has enterprise plan', () => {
    const result = canApplySentryUpgrade({
      isEnterprisePlan: true,
      plans: [
        { value: Plans.USERS_SENTRYY, isSentryPlan: true },
      ] as IndividualPlan[],
    })

    expect(result).toBeFalsy()
  })
})
