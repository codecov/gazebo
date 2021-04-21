import { useMemo } from 'react'
import { format, fromUnixTime, parseISO } from 'date-fns'
import formatDistance from 'date-fns/formatDistance'

export function useDateFormatted(date, formatDescription = 'MMMM do yyyy') {
  return useMemo(() => {
    if (!date) return null
    const parser = typeof date === 'string' ? parseISO : fromUnixTime
    return format(parser(date), formatDescription)
  }, [date, formatDescription])
}

export function formatLastSeen(lastseen) {
  if (!lastseen) return null
  const date = new Date(lastseen)
  const today = new Date()
  return formatDistance(date, today, 'MM/dd/yyyy')
}
