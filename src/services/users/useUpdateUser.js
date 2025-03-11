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
      // Execute passed onSuccess after invalidating queries
      onSuccess.apply(null, args)
    }
  }

  const settleHandler = () => {
    // The following cache busts will trigger react-query to retry the api call updating components depending on this data.
    queryClient.invalidateQueries(['users'])
    queryClient.invalidateQueries(['accountDetails'])
    queryClient.invalidateQueries(['InfiniteUsers'])
    queryClient.invalidateQueries(['GetPlanData'])
  }

  return useMutation({
    mutationFn: ({ targetUserOwnerid, ...body }) => {
      // If the activate user button is clicked multiple times in quick succession, the button loading state can get weird. To solve this we can cancel in-flight refreshes and let this new request trigger the refresh.
      queryClient.cancelQueries(['users'])
      queryClient.cancelQueries(['accountDetails'])
      queryClient.cancelQueries(['InfiniteUsers'])
      queryClient.cancelQueries(['GetPlanData'])
      const path = patchPathUsers({ provider, owner, targetUserOwnerid })
      return Api.patch({ path, provider, body })
    },
    onSuccess: successHandler,
    onSettled: settleHandler,
    ...passedOpts,
  })
}
