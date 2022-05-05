import { format, fromUnixTime, parseISO } from 'date-fns'
import formatDistanceToNow from 'date-fns/formatDistanceToNow'
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
    typeof date === 'number'
      ? fromUnixTime(date)
      : parseISO(new Date(date).toISOString())

  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
  })
}
