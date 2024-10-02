import { renderHook } from '@testing-library/react'

import { useEnterpriseCloudPlanSupport } from './useEnterpriseCloudPlanSupport'

const mocks = vi.hoisted(() => ({
  useFlags: vi.fn(),
}))

vi.mock('shared/featureFlags', () => ({
  useFlags: mocks.useFlags,
}))

describe('useEnterpriseCloudPlanSupport', () => {
  let hookData

  function setup(flagValue) {
    const defaultPlans = ['users-inappm']
    mocks.useFlags.mockReturnValue({
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
