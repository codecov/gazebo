import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function getPathUsers({ provider, owner }) {
  return `/${provider}/${owner}/users/`
}

function fetchUsers({ provider, owner, query, signal }) {
  const path = getPathUsers({ provider, owner })
  return Api.get({ path, provider, query, signal })
}

export function useUsers({ provider, owner, query, opts = {} }) {
  return useQuery({
    queryKey: ['users', provider, owner, query],
    queryFn: ({ signal }) => fetchUsers({ provider, owner, query, signal }),
    keepPreviousData: true,
    staleTime: 5000,
    ...opts,
  })
}
