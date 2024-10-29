import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

interface URLParams {
  provider: string
}

export const useSelfHostedCurrentUser = (options = {}) => {
  const { provider } = useParams<URLParams>()

  return useQuery({
    queryKey: ['SelfHostedCurrentUser', provider],
    queryFn: ({ signal }) =>
      Api.get({ provider, path: '/users/current', signal }),
    ...options,
  })
}
