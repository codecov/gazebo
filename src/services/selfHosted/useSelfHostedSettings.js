import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export const useSelfHostedSettings = () =>
  useQuery(['SelfHostedSettings'], () => Api.get({ path: '/settings' }))
