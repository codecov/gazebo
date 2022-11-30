import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useSelfHostedCurrentUser = (options = {}) =>
  useQuery(
    ['SelfHostedCurrentUser'],
    ({ signal }) => Api.get({ path: '/users/current', signal }),
    options
  )
