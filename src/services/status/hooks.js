import { useQuery } from 'react-query'

export const StatusUrl =
  'https://wdzsn5dlywj9.statuspage.io/api/v2/summary.json'

function fetchStatus() {
  return fetch(StatusUrl, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(async (res) => {
    const data = await res.json()

    return res.ok
      ? data
      : Promise.reject({
          status: res.status,
          data,
        })
  })
}

export function useServerStatus({ opts } = {}) {
  return useQuery('serverStatus', () => fetchStatus(), {
    retry: true,
    refetchOnWindowFocus: true,
    suspense: false,
    select: (data) => {
      return data.status
    },
    ...opts,
  })
}
