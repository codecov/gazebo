import { useQuery } from 'react-query'
import { useCurrentResource } from 'services/currentResource'

import Api from 'shared/api'

export function useUser(options = {}) {
  const { provider } = useCurrentResource()

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
