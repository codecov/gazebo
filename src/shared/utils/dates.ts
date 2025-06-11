import { formatDistanceToNow, fromUnixTime, parseISO } from 'date-fns'

export function formatTimeToNow(date?: string | number | null) {
  if (!date) return null

  const parsedDate =
    typeof date === 'number' ? fromUnixTime(date) : parseISO(date + 'Z')
  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
  })
}

export const formatTimeFromSeconds = (totalSeconds?: number | null) => {
  if (totalSeconds === 0) {
    return '0s'
  }
  if (totalSeconds == null || totalSeconds < 0) {
    return 'N/A'
  }

  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = Math.floor(totalSeconds % 60)

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

  if (timeParts.length === 0 && totalSeconds > 0) {
    return '<1s'
  }

  return timeParts.join(' ')
}
