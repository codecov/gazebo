import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

function patchPathUsers({ provider, owner, targetUserOwnerid }) {
  return `/${provider}/${owner}/users/${targetUserOwnerid}/`
}

export function useUpdateUser({ provider, owner, opts = {} }) {
  const { onSuccess, ...passedOpts } = opts
  const queryClient = useQueryClient()

  const successHandler = (...args) => {
    if (onSuccess) {
      // The following cache busts will trigger react-query to retry the api call updating components depending on this data.
      queryClient.invalidateQueries(['accountDetails'])
      queryClient.invalidateQueries(['GetPlanData'])
      queryClient.invalidateQueries(['users'])
      // Execute passed onSuccess after invalidating queries
      onSuccess.apply(null, args)
    }
  }

  return useMutation({
    mutationFn: ({ targetUserOwnerid, ...body }) => {
      const path = patchPathUsers({ provider, owner, targetUserOwnerid })
      return Api.patch({ path, provider, body })
    },
    onSuccess: successHandler,
    ...passedOpts,
  })
}
