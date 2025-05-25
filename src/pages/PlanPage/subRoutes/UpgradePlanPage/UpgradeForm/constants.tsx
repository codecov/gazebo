// These consts are used when we need to show the time period on copy, hence the first letter being capital
// If we want to check the time period on the plan object itself, we should use the BillingRate enum
// in billing.ts
export const TimePeriods = {
  ANNUAL: 'Annual',
  MONTHLY: 'Monthly',
} as const

export const TierName = {
  TEAM: 'Team',
  PRO: 'Pro',
} as const

export type PlanTiers = typeof TierName.TEAM | typeof TierName.PRO

export type OptionPeriod =
  | typeof TimePeriods.ANNUAL
  | typeof TimePeriods.MONTHLY
