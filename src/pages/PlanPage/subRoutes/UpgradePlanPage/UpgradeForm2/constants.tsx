import { Plans } from 'shared/utils/billing'

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

export type NewPlanType =
  | typeof Plans.USERS_PR_INAPPM
  | typeof Plans.USERS_PR_INAPPY
  | typeof Plans.USERS_SENTRYM
  | typeof Plans.USERS_SENTRYY
  | typeof Plans.USERS_TEAMM
  | typeof Plans.USERS_TEAMM
