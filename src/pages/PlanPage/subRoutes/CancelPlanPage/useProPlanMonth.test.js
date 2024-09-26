import { renderHook } from '@testing-library/react'

import { useProPlanMonth } from './useProPlanMonth'

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

describe('useProPlanMonth', () => {
  function setup(flagValue) {
    mocks.useFlags.mockReturnValue({
      enterpriseCloudPlanSupport: flagValue,
    })
  }

  describe('flag is enabled', () => {
    it('returns the inappm plan', () => {
      const plans = [
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
            'Configurable # of users',
            'Unlimited public repositories',
            'Unlimited private repositories',
            'Priorty Support',
          ],
        },
      ]
      setup(true)

      const { result } = renderHook(() => useProPlanMonth({ plans }))

      expect(result.current).toEqual({
        proPlanMonth: {
          marketingName: 'Pro Team',
          value: 'users-pr-inappm',
          billingRate: 'monthly',
          baseUnitPrice: 12,
          benefits: [
            'Configurable # of users',
            'Unlimited public repositories',
            'Unlimited private repositories',
            'Priorty Support',
          ],
        },
      })
    })
    it('returns the enterprisem plan', () => {
      const plans = [
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
            'Configurable # of users',
            'Unlimited public repositories',
            'Unlimited private repositories',
            'Priorty Support',
          ],
        },
      ]

      setup(true)

      const { result } = renderHook(() => useProPlanMonth({ plans }))

      expect(result.current).toEqual({
        proPlanMonth: {
          marketingName: 'Pro Team',
          value: 'users-enterprisem',
          billingRate: 'monthly',
          baseUnitPrice: 12,
          benefits: [
            'Configurable # of users',
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
      const { result } = renderHook(() =>
        useProPlanMonth({ plans: getPlans() })
      )

      expect(result.current).toEqual({
        proPlanMonth: {
          marketingName: 'Pro Team',
          value: 'users-pr-inappm',
          billingRate: 'monthly',
          baseUnitPrice: 12,
          benefits: [
            'Configurable # of users',
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
        'Configurable # of users',
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
        'Configurable # of users',
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
        'Configurable # of users',
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
        'Configurable # of users',
        'Unlimited public repositories',
        'Unlimited private repositories',
        'Priorty Support',
      ],
    },
  ]
}
