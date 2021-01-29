import { useQuery, useMutation, useQueryClient } from 'react-query'
import update from 'lodash/update'
import findIndex from 'lodash/findIndex'

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

export function useUsers({ provider, owner, query, opts }) {
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

export function useUpdateUser({ provider, owner, params }) {
  const queryClient = useQueryClient()

  function updateUserCache(oldData, user) {
    const index = findIndex(
      oldData.results,
      ({ username }) => username === user.username
    )

    return update(oldData, `results[${index}]`, () => user)
  }

  return useMutation(
    ({ targetUser, ...body }) => {
      const path = patchPathUsers({ provider, owner, targetUser })
      return Api.patch({ path, provider, body })
    },
    {
      onSuccess: (user) => {
        // update the local cache of account details with what the server returns
        queryClient.setQueryData(
          ['users', provider, owner, params],
          (oldData) => updateUserCache(oldData, user)
        )
      },
    }
  )
}
