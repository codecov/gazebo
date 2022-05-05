import { differenceInCalendarDays, parseISO } from 'date-fns'

export const calculateDayDifference = ({ end, start }) => {
  if (end && start) {
    return differenceInCalendarDays(parseISO(end), parseISO(start))
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
