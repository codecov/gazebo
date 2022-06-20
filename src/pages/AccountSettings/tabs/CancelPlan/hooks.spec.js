import { renderHook } from '@testing-library/react-hooks'

import { useFlags } from 'shared/featureFlags'

import { useProPlanMonth } from './hooks'

jest.mock('shared/featureFlags')

describe('useProPlanMonth', () => {
  let hookData

  function setup(flagValue, plans = getPlans()) {
    useFlags.mockReturnValue({
      enterpriseCloudPlanSupport: flagValue,
    })
    hookData = renderHook(() => useProPlanMonth({ plans }))
  }

  describe('flag is enabled', () => {
    it('returns the inappm plan', () => {
      setup(true, [
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
      ])
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
      })
    })
    it('returns the enterprisem plan', () => {
      setup(true, [
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
      ])
      expect(hookData.result.current).toEqual({
        proPlanMonth: {
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
      })
    })
  })

  describe('flag is disabled', () => {
    beforeEach(() => {
      setup(false)
    })
    it('returns the inappm plan', () => {
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
