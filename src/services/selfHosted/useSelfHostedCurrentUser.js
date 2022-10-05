import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useSelfHostedCurrentUser = (options = {}) =>
  useQuery(
    ['SelfHostedCurrentUser'],
    () => Api.get({ path: '/users/current' }),
    options
  )
