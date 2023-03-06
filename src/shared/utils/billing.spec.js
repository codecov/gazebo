import { renderHook } from '@testing-library/react-hooks'

import { useFlags } from 'shared/featureFlags'

import {
  EnterprisePlans,
  formatNumberToUSD,
  getNextBillingDate,
  isAnnualPlan,
  isEnterprisePlan,
  isFreePlan,
  isMonthlyPlan,
  Plans,
  useProPlans,
} from './billing'

jest.mock('shared/featureFlags')

function getPlans() {
  return [
    {
      marketingName: 'Basic',
      value: 'users-free',
      billingRate: null,
      baseUnitPrice: 0,
      benefits: [
        'Up to 5 users',
        'Unlimited public repositories',
        'Unlimited private repositories',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappm',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-pr-inappy',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisem',
      billingRate: 'monthly',
      baseUnitPrice: 12,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
    {
      marketingName: 'Pro Team',
      value: 'users-enterprisey',
      billingRate: 'annually',
      baseUnitPrice: 10,
      benefits: [
        'Configureable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
  ]
}

describe('billing utils', () => {
  function setup(flagValue) {
    useFlags.mockReturnValue({
      enterpriseCloudPlanSupport: flagValue,
    })
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
      expect(isFreePlan('users-pro')).toBe(false)
      expect(isFreePlan('rable rable')).toBe(false)
      expect(isFreePlan(undefined)).toBe(false)
      expect(isFreePlan(12345)).toBe(false)
      expect(isFreePlan({})).toBe(false)
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
      expect(isEnterprisePlan('users-pro')).toBe(false)
      expect(isEnterprisePlan('rable rable')).toBe(false)
      expect(isEnterprisePlan(undefined)).toBe(false)
      expect(isEnterprisePlan(12345)).toBe(false)
      expect(isEnterprisePlan({})).toBe(false)
    })
  })

  describe('useProPlans', () => {
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

  describe('getNextBillingDate', () => {
    describe('there is a valid timestamp', () => {
      it('returns formatted timestamp', () => {
        const value = getNextBillingDate({})

        expect(value).toBeNull()
      })
    })

    describe('there is no timestamp', () => {
      it('returns null', () => {
        const value = getNextBillingDate({
          latestInvoice: {
            periodEnd: 1660000000,
          },
        })

        expect(value).toBe('August 8th, 2022')
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

    it('defaults to false otherwise', () => {
      expect(isAnnualPlan('users-pro')).toBe(false)
      expect(isAnnualPlan('rable rable')).toBe(false)
      expect(isAnnualPlan(undefined)).toBe(false)
      expect(isAnnualPlan(12345)).toBe(false)
      expect(isAnnualPlan({})).toBe(false)
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
      expect(isMonthlyPlan('users-pro')).toBe(false)
      expect(isMonthlyPlan('rable rable')).toBe(false)
      expect(isMonthlyPlan(undefined)).toBe(false)
      expect(isMonthlyPlan(12345)).toBe(false)
      expect(isMonthlyPlan({})).toBe(false)
    })
  })
})
