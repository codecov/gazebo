import { isFreePlan, Plans } from './billing'

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
