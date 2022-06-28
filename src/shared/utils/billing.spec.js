import { EnterprisePlans, isEnterprisePlan, isFreePlan, Plans } from './billing'

describe('billing utils', () => {
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
})
