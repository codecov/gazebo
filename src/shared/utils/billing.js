export const Plans = Object.freeze({
  USERS_FREE: 'users-free',
  USERS_BASIC: 'users-basic',
  USERS_INAPP: 'users-inappm',
  USERS_INAPPY: 'users-inappy',
  USERS_PR_INAPPM: 'users-pr-inappm',
  USERS_PR_INAPPY: 'users-pr-inappy',
})

export function isFreePlan(plan) {
  if (typeof plan !== 'string') return false
  if (plan === Plans.USERS_BASIC || plan === Plans.USERS_FREE) return true
  return false
}
