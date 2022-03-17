import formatDistanceToNow from 'date-fns/formatDistanceToNow'

const getUTCDate = (dt) => {
  const date = new Date(new Date(dt).getTime())

  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
}

export function formatTimeToNow(date) {
  return formatDistanceToNow(getUTCDate(date), {
    addSuffix: true,
  })
}

//https://github.com/date-fns/date-fns/issues/376#issuecomment-353871093
