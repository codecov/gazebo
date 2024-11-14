import {
  formatDistanceToNow,
  fromUnixTime,
  intervalToDuration,
  parseISO,
} from 'date-fns'

export function formatTimeToNow(date?: string | number | null) {
  if (!date) return null

  const parsedDate =
    typeof date === 'number' ? fromUnixTime(date) : parseISO(date + 'Z')
  return formatDistanceToNow(parsedDate, {
    addSuffix: true,
  })
}

export const formatTimeFromSeconds = (totalSeconds?: number | null) => {
  if (totalSeconds === 0) return '0s'
  if (!totalSeconds) return 'N/A'

  const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 })

  const { days, hours, minutes, seconds } = duration

  return [
    days ? `${days}d` : '',
    hours ? `${hours}h` : '',
    minutes ? `${minutes}m` : '',
    seconds ? `${seconds}s` : '',
  ]
    .filter(Boolean)
    .join(' ')
}
