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

const getUTCDate = (date) => {
  const dt = new Date(date)
  const utcDate = Date.UTC(
    dt.getUTCFullYear(),
    dt.getUTCMonth(),
    dt.getUTCDate(),
    dt.getUTCHours(),
    dt.getUTCMinutes(),
    dt.getUTCSeconds()
  )
  return new Date(utcDate)
}

export function formatTimeToNow(date) {
  if (!date) return
  return formatDistanceToNow(getUTCDate(date), {
    addSuffix: true,
  })
}
