import { useQuery } from 'react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export function useUser(options = {}) {
  const { provider } = useParams()

  return useQuery(
    ['currentUser', provider],
    () => {
      return Api.get({
        path: '/profile',
        provider,
      })
    },
    options
  )
}
