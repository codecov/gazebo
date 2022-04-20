import { useMutation, useQuery, useQueryClient } from 'react-query'

import Api from 'shared/api'

function getPathUsers({ provider, owner }) {
  return `/${provider}/${owner}/users/`
}

function patchPathUsers({ provider, owner, targetUserOwnerid }) {
  return `/${provider}/${owner}/users/${targetUserOwnerid}/`
}

function fetchUsers({ provider, owner, query }) {
  const path = getPathUsers({ provider, owner })
  return Api.get({ path, provider, query })
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
  const { onSuccess, ...passedOpts } = opts
  const queryClient = useQueryClient()

  const successHandler = (...args) => {
    // The following cache busts will trigger react-query to retry the api call updating components depending on this data.
    queryClient.invalidateQueries('users')
    queryClient.invalidateQueries('accountDetails')

    if (onSuccess) {
      // Exicute passed onSuccess after invalidating queries
      onSuccess.apply(null, args)
    }
  }

  return useMutation(
    ({ targetUserOwnerid, ...body }) => {
      const path = patchPathUsers({ provider, owner, targetUserOwnerid })
      return Api.patch({ path, provider, body })
    },
    { onSuccess: successHandler, ...passedOpts }
  )
}
