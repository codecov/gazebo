import { useQuery } from 'react-query'

import Api from 'shared/api'

export function useUser(provider, options) {
  return useQuery(
    ['currentUser', provider],
    (_, provider) => {
      return Api.get({
        path: '/profile',
        provider,
      })
    },
    options
  )
}
