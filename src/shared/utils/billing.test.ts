import { renderHook } from '@testing-library/react'

import {
  canApplySentryUpgrade,
  EnterprisePlans,
  findProPlans,
  findSentryPlans,
  findTeamPlans,
  formatNumberToUSD,
  formatTimestampToCalendarDate,
  getNextBillingDate,
  isAnnualPlan,
  isBasicPlan,
  isCodecovProPlan,
  isEnterprisePlan,
  isFreePlan,
  isMonthlyPlan,
  isPaidPlan,
  isProPlan,
  isSentryPlan,
  isTeamPlan,
  isTrialPlan,
  lastTwoDigits,
  Plan,
  Plans,
  shouldDisplayTeamCard,
  useProPlans,
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
    },
    {
      marketingName: 'Pro Team',
      value: Plans.USERS_PR_INAPPM,
      billingRate: 'monthly',
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: Plans.USERS_PR_INAPPY,
      billingRate: 'annually',
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: Plans.USERS_ENTERPRISEM,
      billingRate: 'monthly',
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: Plans.USERS_ENTERPRISEY,
      billingRate: 'annually',
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Sentry Pro Team',
      value: Plans.USERS_SENTRYM,
      billingRate: 'monthly',
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialDays: 14,
    },
    {
      marketingName: 'Sentry Pro Team',
      value: Plans.USERS_SENTRYY,
      billingRate: 'annually',
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialDays: 14,
    },
    {
      marketingName: 'Team',
      value: Plans.USERS_TEAMM,
      billingRate: 'monthly',
      baseUnitPrice: 6,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialDays: null,
    },
    {
      marketingName: 'Team',
      value: Plans.USERS_TEAMY,
      billingRate: 'yearly',
      baseUnitPrice: 5,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialDays: null,
    },
  ]
}

describe('isFreePlan', () => {
  it('supports old free plan', () => {
    expect(isFreePlan('users-free')).toBe(true)
    expect(isFreePlan(Plans.USERS_FREE)).toBe(true)
  })

  it('supports new basic plan', () => {
    expect(isFreePlan('users-basic')).toBe(true)
    expect(isFreePlan(Plans.USERS_BASIC)).toBe(true)
  })

  it('Defaults to false otherwise', () => {
    expect(isFreePlan('users-inappy')).toBe(false)
    expect(isFreePlan(undefined)).toBe(false)
  })
})

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
        billingRate: 'monthly',
        baseUnitPrice: 12,
        monthlyUploadLimit: null,
        benefits: [
          'Configureable # of users',
          'Unlimited public repositories',
          'Unlimited private repositories',
          'Priorty Support',
        ],
      },
      {
        marketingName: 'Pro Team',
        value: Plans.USERS_PR_INAPPY,
        billingRate: 'annually',
        baseUnitPrice: 10,
        monthlyUploadLimit: null,
        benefits: [
          'Configureable # of users',
          'Unlimited public repositories',
          'Unlimited private repositories',
          'Priorty Support',
        ],
      },
    ]
    expect(shouldDisplayTeamCard({ plans })).toBe(false)
  })
})

describe('isEnterprisePlans', () => {
  it('supports enterprise monthly plan', () => {
    expect(isEnterprisePlan('users-enterprisem')).toBe(true)
    expect(isEnterprisePlan(EnterprisePlans.USERS_ENTERPRISEM)).toBe(true)
  })

  it('supports enterprise yearly plan', () => {
    expect(isEnterprisePlan('users-enterprisey')).toBe(true)
    expect(isEnterprisePlan(EnterprisePlans.USERS_ENTERPRISEY)).toBe(true)
  })

  it('defaults to false otherwise', () => {
    expect(isEnterprisePlan('users-inappy')).toBe(false)
    expect(isEnterprisePlan(undefined)).toBe(false)
  })
})

describe('useProPlans', () => {
  function setup(flagValue: boolean) {
    mocks.useFlags.mockReturnValue({
      enterpriseCloudPlanSupport: flagValue,
    })
  }

  describe('flag is true', () => {
    beforeEach(() => {
      setup(true)
    })

    it('contains enterprise plans', async () => {
      const { result } = renderHook(() => useProPlans({ plans: getPlans() }))

      expect(result.current).toEqual({
        proPlanMonth: {
          marketingName: 'Pro Team',
          value: 'users-pr-inappm',
          billingRate: 'monthly',
          baseUnitPrice: 12,
          monthlyUploadLimit: null,
          benefits: [
            'Configureable # of users',
            'Unlimited public repositories',
            'Unlimited private repositories',
            'Priorty Support',
          ],
        },
        proPlanYear: {
          marketingName: 'Pro Team',
          value: 'users-pr-inappy',
          billingRate: 'annually',
          baseUnitPrice: 10,
          monthlyUploadLimit: null,
          benefits: [
            'Configureable # of users',
            'Unlimited public repositories',
            'Unlimited private repositories',
            'Priorty Support',
          ],
        },
      })
    })
  })

  describe('flag is false', () => {
    beforeEach(() => {
      setup(false)
    })
    it('does not contain enterprise plans', () => {
      const { result } = renderHook(() => useProPlans({ plans: getPlans() }))

      expect(result.current).toEqual({
        proPlanMonth: {
          marketingName: 'Pro Team',
          value: 'users-pr-inappm',
          billingRate: 'monthly',
          baseUnitPrice: 12,
          monthlyUploadLimit: null,
          benefits: [
            'Configureable # of users',
            'Unlimited public repositories',
            'Unlimited private repositories',
            'Priorty Support',
          ],
        },
        proPlanYear: {
          marketingName: 'Pro Team',
          value: 'users-pr-inappy',
          billingRate: 'annually',
          baseUnitPrice: 10,
          monthlyUploadLimit: null,
          benefits: [
            'Configureable # of users',
            'Unlimited public repositories',
            'Unlimited private repositories',
            'Priorty Support',
          ],
        },
      })
    })
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
    // @ts-expect-error
    const value = formatTimestampToCalendarDate('1660000000')

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
    // @ts-expect-error
    const value = lastTwoDigits(null)

    expect(value).toBe(null)
  })
})

describe('getNextBillingDate', () => {
  describe('there is a valid timestamp', () => {
    it('returns formatted timestamp', () => {
      const value = getNextBillingDate({
        subscriptionDetail: {
          // @ts-expect-error
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
      // @ts-expect-error
      const value = getNextBillingDate({})

      expect(value).toBeNull()
    })
  })
})

describe('isAnnualPlan', () => {
  it('supports enterprise annual plan', () => {
    expect(isAnnualPlan('users-enterprisey')).toBe(true)
    expect(isAnnualPlan(EnterprisePlans.USERS_ENTERPRISEY)).toBe(true)
  })

  it('supports basic annual plan', () => {
    expect(isAnnualPlan('users-inappy')).toBe(true)
    expect(isAnnualPlan(Plans.USERS_INAPPY)).toBe(true)
  })

  it('supports annual pr plan', () => {
    expect(isAnnualPlan('users-pr-inappy')).toBe(true)
    expect(isAnnualPlan(Plans.USERS_PR_INAPPY)).toBe(true)
  })

  it('supports annual team plan', () => {
    expect(isAnnualPlan('users-teamy')).toBe(true)
    expect(isAnnualPlan(Plans.USERS_PR_INAPPY)).toBe(true)
  })

  it('defaults to false otherwise', () => {
    expect(isAnnualPlan('users-inappm')).toBe(false)
    expect(isAnnualPlan(undefined)).toBe(false)
  })
})

describe('isMonthlyPlan', () => {
  it('supports enterprise monthly plan', () => {
    expect(isMonthlyPlan('users-enterprisem')).toBe(true)
    expect(isMonthlyPlan(EnterprisePlans.USERS_ENTERPRISEM)).toBe(true)
  })

  it('supports basic monthly plan', () => {
    expect(isMonthlyPlan('users-inappm')).toBe(true)
    expect(isMonthlyPlan(Plans.USERS_INAPP)).toBe(true)
  })

  it('supports monthly pr plan', () => {
    expect(isMonthlyPlan('users-pr-inappm')).toBe(true)
    expect(isMonthlyPlan(Plans.USERS_PR_INAPPM)).toBe(true)
  })

  it('defaults to false otherwise', () => {
    expect(isMonthlyPlan('users-inappy')).toBe(false)
    expect(isMonthlyPlan(undefined)).toBe(false)
  })
})

describe('isSentryPlan', () => {
  it('supports monthly plan', () => {
    expect(isSentryPlan('users-sentrym')).toBe(true)
    expect(isSentryPlan(Plans.USERS_SENTRYM)).toBe(true)
  })

  it('supports annual plan', () => {
    expect(isSentryPlan('users-sentryy')).toBe(true)
    expect(isSentryPlan(Plans.USERS_SENTRYY)).toBe(true)
  })

  it('Defaults to false otherwise', () => {
    expect(isSentryPlan('users-inappy')).toBe(false)
    expect(isSentryPlan(undefined)).toBe(false)
  })
})

describe('isPaidPlan', () => {
  it('supports monthly plans', () => {
    expect(isPaidPlan(Plans.USERS_INAPP)).toBe(true)
    expect(isPaidPlan(Plans.USERS_PR_INAPPM)).toBe(true)
    expect(isPaidPlan(Plans.USERS_ENTERPRISEM)).toBe(true)
    expect(isPaidPlan(Plans.USERS_SENTRYM)).toBe(true)
  })

  it('supports annual plans', () => {
    expect(isPaidPlan(Plans.USERS_INAPPY)).toBe(true)
    expect(isPaidPlan(Plans.USERS_PR_INAPPY)).toBe(true)
    expect(isPaidPlan(Plans.USERS_ENTERPRISEY)).toBe(true)
    expect(isPaidPlan(Plans.USERS_SENTRYY)).toBe(true)
  })

  it('false for free plans', () => {
    expect(isPaidPlan(Plans.USERS_BASIC)).toBe(false)
    expect(isPaidPlan(Plans.USERS_FREE)).toBe(false)
  })

  it('defaults to false otherwise', () => {
    expect(isPaidPlan('users-free')).toBe(false)
    expect(isPaidPlan(undefined)).toBe(false)
  })
})

describe('findSentryPlans', () => {
  it('contains monthly plan', () => {
    const plans = getPlans()
    const { sentryPlanMonth } = findSentryPlans({ plans })

    const expectedResult = {
      marketingName: 'Sentry Pro Team',
      value: 'users-sentrym',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialDays: 14,
    }

    expect(sentryPlanMonth).toStrictEqual(expectedResult)
  })

  it('contains annual plan', () => {
    const plans = getPlans()
    const { sentryPlanYear } = findSentryPlans({ plans })

    const expectedResult = {
      marketingName: 'Sentry Pro Team',
      value: 'users-sentryy',
      billingRate: 'annually',
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Includes 5 seats',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priority Support',
      ],
      trialDays: 14,
    }

    expect(sentryPlanYear).toStrictEqual(expectedResult)
  })
})

describe('findProPlans', () => {
  it('contains monthly plan', () => {
    const plans = getPlans()
    const { proPlanMonth } = findProPlans({ plans })

    const expectedResult = {
      marketingName: 'Pro Team',
      value: 'users-pr-inappm',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    }

    expect(proPlanMonth).toStrictEqual(expectedResult)
  })

  it('contains annual plan', () => {
    const plans = getPlans()
    const { proPlanYear } = findProPlans({ plans })

    const expectedResult = {
      marketingName: 'Pro Team',
      value: 'users-pr-inappy',
      billingRate: 'annually',
      baseUnitPrice: 10,
      monthlyUploadLimit: null,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
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
      value: 'users-teamm',
      billingRate: 'monthly',
      baseUnitPrice: 6,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialDays: null,
    }

    expect(teamPlanMonth).toStrictEqual(expectedResult)
  })

  it('contains annual plan', () => {
    const plans = getPlans()
    const { teamPlanYear } = findTeamPlans({ plans })

    const expectedResult = {
      marketingName: 'Team',
      value: 'users-teamy',
      billingRate: 'yearly',
      baseUnitPrice: 5,
      monthlyUploadLimit: null,
      benefits: [
        'Up to 10 users',
        'Unlimited repositories',
        '2500 repositories',
        'Patch coverage analysis',
      ],
      trialDays: null,
    }

    expect(teamPlanYear).toStrictEqual(expectedResult)
  })
})

describe('canApplySentryUpgrade', () => {
  it('returns true when list contains monthly plan', () => {
    const result = canApplySentryUpgrade({
      plan: Plans.USERS_PR_INAPPM,
      plans: [{ value: 'users-sentrym' }] as Plan[],
    })

    expect(result).toBeTruthy()
  })

  it('returns true when list contains annual plan', () => {
    const result = canApplySentryUpgrade({
      plan: Plans.USERS_PR_INAPPM,
      plans: [{ value: 'users-sentryy' }] as Plan[],
    })

    expect(result).toBeTruthy()
  })

  it('returns false when plans are not in list', () => {
    const result = canApplySentryUpgrade({
      plan: Plans.USERS_PR_INAPPM,
      plans: [{ value: 'users-free' }] as Plan[],
    })

    expect(result).toBeFalsy()
  })

  it('returns false when user has enterprise plan', () => {
    const result = canApplySentryUpgrade({
      plan: Plans.USERS_ENTERPRISEM,
      plans: [{ value: 'users-sentryy' }] as Plan[],
    })

    expect(result).toBeFalsy()
  })
})

describe('isBasicPlan', () => {
  it('returns true when plan is basic', () => {
    expect(isBasicPlan(Plans.USERS_BASIC)).toBeTruthy()
  })

  it('returns false when plan is not basic', () => {
    expect(isBasicPlan(Plans.USERS_FREE)).toBeFalsy()
    expect(isBasicPlan(Plans.USERS_INAPP)).toBeFalsy()
    expect(isBasicPlan(Plans.USERS_ENTERPRISEM)).toBeFalsy()
    expect(isBasicPlan(Plans.USERS_SENTRYM)).toBeFalsy()
  })
})

describe('isTeamPlan', () => {
  it('returns true when plan is team monthly or yearly', () => {
    expect(isTeamPlan(Plans.USERS_TEAMM)).toBeTruthy()
    expect(isTeamPlan(Plans.USERS_TEAMY)).toBeTruthy()
  })

  it('returns false when plan is not team monthly or yearly', () => {
    expect(isTeamPlan(Plans.USERS_FREE)).toBeFalsy()
    expect(isTeamPlan(Plans.USERS_BASIC)).toBeFalsy()
    expect(isTeamPlan(Plans.USERS_INAPP)).toBeFalsy()
    expect(isTeamPlan(Plans.USERS_ENTERPRISEM)).toBeFalsy()
    expect(isTeamPlan(Plans.USERS_SENTRYM)).toBeFalsy()
  })
})

describe('isTrialPlan', () => {
  it('returns true when plan is trial', () => {
    expect(isTrialPlan(Plans.USERS_TRIAL)).toBeTruthy()
  })

  it('returns false when plan is not trial', () => {
    expect(isTrialPlan(Plans.USERS_FREE)).toBeFalsy()
    expect(isTrialPlan(Plans.USERS_INAPP)).toBeFalsy()
    expect(isTrialPlan(Plans.USERS_ENTERPRISEM)).toBeFalsy()
    expect(isTrialPlan(Plans.USERS_SENTRYM)).toBeFalsy()
    expect(isTrialPlan(Plans.USERS_BASIC)).toBeFalsy()
  })
})

describe('isProPlan', () => {
  it('returns true when plan is pro', () => {
    expect(isProPlan(Plans.USERS_PR_INAPPM)).toBeTruthy()
  })

  it('returns true when plan is sentry pro', () => {
    expect(isProPlan(Plans.USERS_SENTRYM)).toBeTruthy()
  })

  it('returns false when plan is not pro', () => {
    expect(isProPlan(Plans.USERS_FREE)).toBeFalsy()
    expect(isProPlan(Plans.USERS_ENTERPRISEM)).toBeFalsy()
    expect(isProPlan(Plans.USERS_BASIC)).toBeFalsy()
  })
})

describe('isCodecovProPlan', () => {
  it('returns true when plan is codecov pro', () => {
    expect(isCodecovProPlan(Plans.USERS_PR_INAPPM)).toBeTruthy()
  })

  it('returns false when plan is not codecov pro', () => {
    expect(isCodecovProPlan(Plans.USERS_FREE)).toBeFalsy()
    expect(isCodecovProPlan(Plans.USERS_ENTERPRISEM)).toBeFalsy()
    expect(isCodecovProPlan(Plans.USERS_SENTRYM)).toBeFalsy()
    expect(isCodecovProPlan(Plans.USERS_BASIC)).toBeFalsy()
  })
})
