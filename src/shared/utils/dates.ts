import * as dateFns from 'date-fns'

const SECONDS_PER_DAY = 86400
const SECONDS_PER_HOUR = 3600
const SECONDS_PER_MINUTE = 60

export function formatTimeToNow(date?: string | number | null) {
  if (!date) return null

  const parsedDate =
    typeof date === 'number'
      ? dateFns.fromUnixTime(date)
      : dateFns.parseISO(date + 'Z')
  return dateFns.formatDistanceToNow(parsedDate, {
    addSuffix: true,
  })
}

export const formatTimeFromSeconds = (totalSeconds?: number | null) => {
  if (totalSeconds == null || totalSeconds < 0) return 'N/A'
  if (totalSeconds === 0) return '0s'
  if (totalSeconds < 1) return '<1s'

  const days = Math.floor(totalSeconds / SECONDS_PER_DAY)
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR)
  const minutes = Math.floor(
    (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE
  )
  const seconds = Math.floor(totalSeconds % SECONDS_PER_MINUTE)

  const timeParts = []
  if (days > 0) {
    timeParts.push(`${days}d`)
  }
  if (hours > 0) {
    timeParts.push(`${hours}h`)
  }
  if (minutes > 0) {
    timeParts.push(`${minutes}m`)
  }
  if (seconds > 0) {
    timeParts.push(`${seconds}s`)
  }

  return timeParts.join(' ')
}
