import { renderHook } from '@testing-library/react-hooks'

import { useFlags } from 'shared/featureFlags'

import { useEnterpriseCloudPlanSupport } from './useEnterpriseCloudPlanSupport'

jest.mock('shared/featureFlags')

describe('useEnterpriseCloudPlanSupport', () => {
  function setup(flagValue) {
    useFlags.mockReturnValue({
      enterpriseCloudPlanSupport: flagValue,
    })
  }

  describe('flag is true', () => {
    beforeEach(() => {
      setup(true)
    })
    it('adds enterprise plans to list', () => {
      const { result } = renderHook(() =>
        useEnterpriseCloudPlanSupport({ plans: ['users-inappm'] })
      )
      expect(result.current).toEqual({
        plans: ['users-inappm', 'users-enterprisem', 'users-enterprisey'],
      })
    })
  })

  describe('flag is false', () => {
    beforeEach(() => {
      setup(false)
    })
    it('does not modify the list', () => {
      const { result } = renderHook(() =>
        useEnterpriseCloudPlanSupport({ plans: ['users-inappm'] })
      )
      expect(result.current).toEqual({ plans: ['users-inappm'] })
    })
  })
})
