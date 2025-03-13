import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import Api from 'shared/api'

function patchPathUsers({ provider, owner, targetUserOwnerid }) {
  return `/${provider}/${owner}/users/${targetUserOwnerid}/`
}

export function useUpdateUser({ provider, owner, opts = {} }) {
  const { onSuccess, ...passedOpts } = opts
  const queryClient = useQueryClient()
  const [refetchTimeout, setRefetchTimeout] = useState(0)

  const successHandler = (...args) => {
    if (onSuccess) {
      // The following cache busts will trigger react-query to retry the api call updating components depending on this data.
      queryClient.invalidateQueries(['accountDetails'])
      queryClient.invalidateQueries(['GetPlanData'])

      setRefetchTimeout(
        setTimeout(() => queryClient.invalidateQueries(['users']), 1000)
      )

      // Execute passed onSuccess after invalidating queries
      onSuccess.apply(null, args)
    }
  }

  return useMutation({
    mutationFn: ({ targetUserOwnerid, ...body }) => {
      // Prevent refreshing users list until done chaining requests w/ timeout
      clearTimeout(refetchTimeout)
      queryClient.cancelQueries(['users'])

      const path = patchPathUsers({ provider, owner, targetUserOwnerid })
      return Api.patch({ path, provider, body })
    },
    onSuccess: successHandler,
    ...passedOpts,
  })
}
