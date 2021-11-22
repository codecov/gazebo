import { isFreePlan, Plans } from './billing'

describe('isFreePlan', () => {
  it('supports old free plan', () => {
    expect(isFreePlan('users-free')).toBeTruthy()
    expect(isFreePlan(Plans.USERS_FREE)).toBeTruthy()
  })

  it('supports new basic plan', () => {
    expect(isFreePlan('users-basic')).toBeTruthy()
    expect(isFreePlan(Plans.USERS_BASIC)).toBeTruthy()
  })

  it('Defaults to false otherwise', () => {
    expect(isFreePlan('users-pro')).toBeFalsy()
    expect(isFreePlan('rable rable')).toBeFalsy()
    expect(isFreePlan(undefined)).toBeFalsy()
    expect(isFreePlan(12345)).toBeFalsy()
    expect(isFreePlan({})).toBeFalsy()
  })
})
