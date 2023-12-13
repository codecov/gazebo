export const TimePeriods = {
  ANNUAL: 'Annual',
  MONTHLY: 'Monthly',
} as const

export type OptionPeriod =
  | typeof TimePeriods.ANNUAL
  | typeof TimePeriods.MONTHLY
