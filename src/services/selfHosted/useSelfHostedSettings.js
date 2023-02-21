import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useSelfHostedSettings = () =>
  useQuery({
    queryKey: ['SelfHostedSettings'],
    queryFn: ({ signal }) => Api.get({ path: '/settings', signal }),
  })
