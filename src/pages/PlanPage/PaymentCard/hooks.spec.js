import { renderHook } from '@testing-library/react-hooks'

import { useFlags } from 'shared/featureFlags'

import { useEnterpriseCloudPlanSupport } from './hooks'

jest.mock('shared/featureFlags')

describe('useEnterpriseCloudPlanSupport', () => {
  let hookData

  function setup(flagValue) {
    const defaultPlans = ['users-inappm']
    useFlags.mockReturnValue({
      enterpriseCloudPlanSupport: flagValue,
    })
    hookData = renderHook(() =>
      useEnterpriseCloudPlanSupport({ plans: defaultPlans })
    )
  }

  describe('flag is true', () => {
    beforeEach(() => {
      setup(true)
    })
    it('adds enterprise plans to list', () => {
      expect(hookData.result.current).toEqual({
        plans: ['users-inappm', 'users-enterprisem', 'users-enterprisey'],
      })
    })
  })

  describe('flag is false', () => {
    beforeEach(() => {
      setup(false)
    })
    it('does not modify the list', () => {
      expect(hookData.result.current).toEqual({ plans: ['users-inappm'] })
    })
  })
})
