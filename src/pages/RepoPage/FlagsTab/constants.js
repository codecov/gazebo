export const MEASUREMENT_INTERVAL = Object.freeze({
  INTERVAL_30_DAY: 'INTERVAL_30_DAY',
  INTERVAL_7_DAY: 'INTERVAL_7_DAY',
  INTERVAL_1_DAY: 'INTERVAL_1_DAY',
})

export const MEASUREMENT_TIME_INTERVALS = Object.freeze({
  ALL_TIME: MEASUREMENT_INTERVAL.INTERVAL_30_DAY,
  LAST_6_MONTHS: MEASUREMENT_INTERVAL.INTERVAL_7_DAY,
  LAST_3_MONTHS: MEASUREMENT_INTERVAL.INTERVAL_7_DAY,
  LAST_30_DAYS: MEASUREMENT_INTERVAL.INTERVAL_1_DAY,
  LAST_7_DAYS: MEASUREMENT_INTERVAL.INTERVAL_1_DAY,
})

export const AFTER_DATE_FORMAT_OPTIONS = Object.freeze({
  LAST_6_MONTHS: { months: 6 },
  LAST_3_MONTHS: { months: 3 },
  LAST_30_DAYS: { days: 30 },
  LAST_7_DAYS: { days: 7 },
})

export const TimeOptions = [
  { label: 'All time', value: 'ALL_TIME' },
  { label: 'Last 6 months', value: 'LAST_6_MONTHS' },
  { label: 'Last 3 months', value: 'LAST_3_MONTHS' },
  { label: 'Last 30 days', value: 'LAST_30_DAYS' },
  { label: 'Last 7 days', value: 'LAST_7_DAYS' },
]
