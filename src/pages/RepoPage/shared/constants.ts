export const MEASUREMENT_INTERVAL = {
  INTERVAL_30_DAY: 'INTERVAL_30_DAY',
  INTERVAL_7_DAY: 'INTERVAL_7_DAY',
  INTERVAL_1_DAY: 'INTERVAL_1_DAY',
} as const

export type MEASUREMENT_INTERVAL_TYPE = keyof typeof MEASUREMENT_INTERVAL

export const MeasurementTimeOptions = [
  { label: 'Last 30 days', value: MEASUREMENT_INTERVAL.INTERVAL_30_DAY },
  { label: 'Last 7 days', value: MEASUREMENT_INTERVAL.INTERVAL_7_DAY },
  { label: 'Last day', value: MEASUREMENT_INTERVAL.INTERVAL_1_DAY },
] as const

export type MeasurementTimeOption = (typeof MeasurementTimeOptions)[number]

export const MEASUREMENT_TIME_INTERVALS = {
  ALL_TIME: MEASUREMENT_INTERVAL.INTERVAL_30_DAY,
  LAST_6_MONTHS: MEASUREMENT_INTERVAL.INTERVAL_7_DAY,
  LAST_3_MONTHS: MEASUREMENT_INTERVAL.INTERVAL_7_DAY,
  LAST_30_DAYS: MEASUREMENT_INTERVAL.INTERVAL_1_DAY,
  LAST_7_DAYS: MEASUREMENT_INTERVAL.INTERVAL_1_DAY,
} as const

export const AFTER_DATE_FORMAT_OPTIONS = {
  LAST_6_MONTHS: { months: 6 },
  LAST_3_MONTHS: { months: 3 },
  LAST_30_DAYS: { days: 30 },
  LAST_7_DAYS: { days: 7 },
} as const

export const TIME_OPTION_VALUES = {
  ALL_TIME: 'ALL_TIME',
  LAST_6_MONTHS: 'LAST_6_MONTHS',
  LAST_3_MONTHS: 'LAST_3_MONTHS',
  LAST_30_DAYS: 'LAST_30_DAYS',
  LAST_7_DAYS: 'LAST_7_DAYS',
} as const

export type TIME_OPTION_KEY = keyof typeof TIME_OPTION_VALUES

export const TimeOptions = [
  { label: 'All time', value: TIME_OPTION_VALUES.ALL_TIME },
  { label: 'Last 6 months', value: TIME_OPTION_VALUES.LAST_6_MONTHS },
  { label: 'Last 3 months', value: TIME_OPTION_VALUES.LAST_3_MONTHS },
  { label: 'Last 30 days', value: TIME_OPTION_VALUES.LAST_30_DAYS },
  { label: 'Last 7 days', value: TIME_OPTION_VALUES.LAST_7_DAYS },
] as const

export type TimeOption = (typeof TimeOptions)[number]
