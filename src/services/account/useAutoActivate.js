import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

function getPathAccountDetails({ provider, owner }) {
  return `/${provider}/${owner}/account-details/`
}

export function useAutoActivate({ provider, owner, opts = {} }) {
  const queryClient = useQueryClient()
  const { onSuccess, ...passedOpts } = opts

  const successHandler = (...args) => {
    // The following cache busts will trigger react-query to retry the api call updating components depending on this data.
    queryClient.invalidateQueries(['users'])
    queryClient.invalidateQueries(['accountDetails'])

    if (onSuccess) {
      // Exicute passed onSuccess after invalidating queries
      onSuccess.apply(null, args)
    }
  }

  return useMutation({
    mutationFn: (activate) => {
      const path = getPathAccountDetails({ provider, owner })
      const body = {
        /* eslint-disable camelcase */
        plan_auto_activate: activate,
        /* eslint-enable camelcase */
      }

      return Api.patch({
        path,
        provider,
        body,
      })
    },
    onSuccess: successHandler,
    ...passedOpts,
  })
}
