import {
  differenceInCalendarDays,
  parseISO,
  subDays,
  subMonths,
} from 'date-fns'

export const Trend = Object.freeze({
  TWENTY_FOUR_HOURS: '24 hours',
  SEVEN_DAYS: '7 days',
  THIRTY_DAYS: '30 days',
  THREE_MONTHS: '3 months',
  SIX_MONTHS: '6 months',
  LAST_YEAR: 'last year',
  ALL_TIME: 'all time',
})

const GroupingUnit = Object.freeze({
  COMMIT: 'commit',
  HOUR: 'hour',
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
})

// eslint-disable-next-line complexity
const calculateTrendDate = ({ today, trend }) => {
  if (trend === Trend.TWENTY_FOUR_HOURS) return subDays(today, 1)
  if (trend === Trend.SEVEN_DAYS) return subDays(today, 7)
  if (trend === Trend.THIRTY_DAYS) return subDays(today, 30)
  if (trend === Trend.THREE_MONTHS) return subMonths(today, 3)
  if (trend === Trend.SIX_MONTHS) return subMonths(today, 6)
  if (trend === Trend.LAST_YEAR) return subMonths(today, 12)
  if (trend === Trend.ALL_TIME) return null
  return null
}

export const calculateDayDifference = ({ end, start }) => {
  if (end && start) {
    const _end = typeof end === 'string' ? parseISO(end) : end
    const _start = typeof start === 'string' ? parseISO(start) : start

    return differenceInCalendarDays(_end, _start)
  }
  return 0
}

export function chartQuery({ endDate, startDate, repositories }) {
  const dayDifferenceThreshold = 180
  const dayDifference = calculateDayDifference({
    end: endDate,
    start: startDate,
  })
  const groupingUnit = dayDifference < dayDifferenceThreshold ? 'day' : 'week'
  const _startDate = startDate ? startDate : undefined
  const _endDate = endDate ? endDate : undefined

  const _repositories = repositories?.length > 0 ? repositories : undefined

  return {
    groupingUnit,
    startDate: _startDate,
    endDate: _endDate,
    repositories: _repositories,
  }
}

function sparklineGroupingUnit({ dayDifference }) {
  const A_YEAR = 360
  const TWO_MONTHS = 61
  const TWO_WEEKS = 14

  if (dayDifference >= A_YEAR) {
    return GroupingUnit.MONTH
  } else if (dayDifference >= TWO_MONTHS) {
    return GroupingUnit.WEEK
  } else if (dayDifference >= TWO_WEEKS) {
    return GroupingUnit.DAY
  } else if (dayDifference > 0) {
    return GroupingUnit.HOUR
  }
  return GroupingUnit.MONTH
}

export function sparklineQuery({ trend, branch, repo, today }) {
  const startDate = calculateTrendDate({ today, trend })
  const dayDifference = calculateDayDifference({
    end: today,
    start: startDate,
  })
  const groupingUnit = sparklineGroupingUnit({ dayDifference })
  const _startDate = startDate ? { startDate } : {}

  return {
    repositories: [repo],
    branch,
    coverageTimestampOrdering: 'increasing',
    aggValue: 'timestamp',
    aggFunction: 'min',
    groupingUnit,
    ..._startDate,
  }
}
