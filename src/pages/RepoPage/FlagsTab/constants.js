export const MEASUREMENT_INTERVAL = Object.freeze({
  INTERVAL_30_DAY: 'INTERVAL_30_DAY',
  INTERVAL_7_DAY: 'INTERVAL_7_DAY',
  INTERVAL_1_DAY: 'INTERVAL_1_DAY',
})

export const TimeOptions = [
  { label: 'All time', value: '' },
  // { label: 'Last 6 months', value: 'SOME_CONST' },
  // { label: 'Last 3 months', value: 'SOME_CONST' },
  { label: 'Last 30 days', value: MEASUREMENT_INTERVAL.INTERVAL_30_DAY },
  { label: 'Last 7 days', value: MEASUREMENT_INTERVAL.INTERVAL_7_DAY },
]
