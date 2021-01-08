import { useQuery } from 'react-query'

import Api from 'shared/api'

function getPathUsers({ provider, owner }) {
  return `/${provider}/${owner}/users/`
}

function fetchUsers({ provider, owner, query }) {
  const path = getPathUsers({ provider, owner })
  return Api.get({ path, provider, query })
}

export function useUsers({ provider, owner, query }) {
  return useQuery(
    ['users', provider, owner, query],
    () => fetchUsers({ provider, owner, query }),
    {
      keepPreviousData: true,
      staleTime: 5000,
    }
  )
}
