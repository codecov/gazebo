export const MEASUREMENT_INTERVAL = Object.freeze({
  INTERVAL_30_DAY: 'INTERVAL_30_DAY',
  INTERVAL_7_DAY: 'INTERVAL_7_DAY',
  INTERVAL_1_DAY: 'INTERVAL_1_DAY',
})

export const MEASUREMENT_TIME_INTERVALS = Object.freeze({
  ALL_TIME: MEASUREMENT_INTERVAL.INTERVAL_30_DAY,
  LAST_6_MONTHS: MEASUREMENT_INTERVAL.INTERVAL_7_DAY,
  LAST_3_MONTHS: MEASUREMENT_INTERVAL.INTERVAL_7_DAY,
  LAST_30_DAYS: MEASUREMENT_INTERVAL.INTERVAL_7_DAY,
  LAST_7_DAYS: MEASUREMENT_INTERVAL.INTERVAL_1_DAY,
})

export const AFTER_DATE_FORMAT_OPTIONS = Object.freeze({
  LAST_6_MONTHS: { months: 6 },
  LAST_3_MONTHS: { months: 3 },
  LAST_30_DAYS: { days: 30 },
  LAST_7_DAYS: { days: 7 },
})

export const TimeOptions = [
  { label: 'All time' },
  { label: 'Last 6 months' },
  { label: 'Last 3 months' },
  { label: 'Last 30 days' },
  { label: 'Last 7 days' },
]
