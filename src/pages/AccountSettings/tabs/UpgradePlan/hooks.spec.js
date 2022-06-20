import { renderHook } from '@testing-library/react-hooks'

import { useFlags } from 'shared/featureFlags'

import { useProPlans } from './hooks'

jest.mock('shared/featureFlags')

describe('useProPlans', () => {
  let hookData

  function setup(flagValue) {
    const plans = getPlans()
    useFlags.mockReturnValue({
      enterpriseCloudPlanSupport: flagValue,
    })
    hookData = renderHook(() => useProPlans({ plans: plans }))
  }

  describe('flag is true', () => {
    beforeEach(() => {
      setup(true)
    })
    it('contains enterprise plans', () => {
      expect(hookData.result.current).toEqual({
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
      expect(hookData.result.current).toEqual({
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
