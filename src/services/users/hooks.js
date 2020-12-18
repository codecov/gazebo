import { useQuery, useMutation } from 'react-query'

import Api from 'shared/api'

function getPathUsers({ provider, owner }) {
  return `/${provider}/${owner}/users/`
}

function putPathUsers({ provider, owner, targetUser }) {
  return `/${provider}/${owner}/users/${targetUser}/`
}

function fetchUsers({ provider, owner, query }) {
  const path = getPathUsers({ provider, owner })
  return Api.get({ path, provider, query })
}

function putUsers({ provider, owner, targetUser, activated }) {
  const path = putPathUsers({ provider, owner, targetUser })
  return Api.put({ path, body: { activated, is_admin: true } })
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

export function useActivateUser({ provider, owner, query }) {
  return useMutation(({ activated, targetUser }) =>
    putUsers({ provider, owner, targetUser, activated })
  )
}
