import { useQuery, useMutation, useQueryClient } from 'react-query'
import Api from 'shared/api'

function getPathUsers({ provider, owner }) {
  return `/${provider}/${owner}/users/`
}

function patchPathUsers({ provider, owner, targetUser }) {
  return `/${provider}/${owner}/users/${targetUser}/`
}

function fetchUsers({ provider, owner, query }) {
  const path = getPathUsers({ provider, owner })
  return Api.get({ path, provider, query })
}

export function useInvalidateUsers() {
  const queryClient = useQueryClient()

  return () => queryClient.invalidateQueries('users')
}

export function useUsers({ provider, owner, query, opts = {} }) {
  return useQuery(
    ['users', provider, owner, query],
    () => fetchUsers({ provider, owner, query }),
    {
      keepPreviousData: true,
      staleTime: 5000,
      ...opts,
    }
  )
}

export function useUpdateUser({ provider, owner, opts = {} }) {
  return useMutation(
    ({ targetUser, ...body }) => {
      const path = patchPathUsers({ provider, owner, targetUser })
      return Api.patch({ path, provider, body })
    },
    { ...opts }
  )
}
