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
