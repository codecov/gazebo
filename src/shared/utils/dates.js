import {
  format,
  formatDistanceToNow,
  formatDuration,
  fromUnixTime,
  intervalToDuration,
  parseISO,
} from 'date-fns'
import { useMemo } from 'react'

export function useDateFormatted(date, formatDescription = 'MMMM do yyyy') {
  return useMemo(() => {
    if (!date) return null
    const parser = typeof date === 'string' ? parseISO : fromUnixTime
    return format(parser(date), formatDescription)
  }, [date, formatDescription])
}

export function formatTimeToNow(date) {
  if (!date) return null

  const parsedDate =
    typeof date === 'number' ? fromUnixTime(date) : parseISO(date + 'Z')
  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
  })
}

export const formatTimeFromSeconds = (totalSeconds) => {
  if (totalSeconds === 0) return '0s'
  if (!totalSeconds) return 'N/A'

  const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 })
  return formatDuration(duration)
}
