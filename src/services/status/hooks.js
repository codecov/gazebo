import { useQuery } from 'react-query'

const statusApi = 'https://wdzsn5dlywj9.statuspage.io/api/v2/summary.json'

function fetchStatus() {
  return fetch(statusApi, {
    method: 'GET',
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

export function useServerStatus() {
  return useQuery('serverStatus', () => fetchStatus(), {
    retry: true,
    refetchOnWindowFocus: true,
  })
}
