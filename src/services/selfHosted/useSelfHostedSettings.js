import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export const useSelfHostedSettings = () => {
  const { provider } = useParams()

  return useQuery({
    queryKey: ['SelfHostedSettings', provider],
    queryFn: ({ signal }) => Api.get({ provider, path: '/settings', signal }),
  })
}
