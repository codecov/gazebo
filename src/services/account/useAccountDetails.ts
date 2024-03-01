import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export interface UseAccountDetailsArgs {
  provider: string
  owner: string
  opts?: {
    enabled?: boolean
  }
}

function getPathAccountDetails({
  provider,
  owner,
}: {
  provider: string
  owner: string
}) {
  return `/${provider}/${owner}/account-details/`
}

function fetchAccountDetails({
  provider,
  owner,
  signal,
}: {
  provider: string
  owner: string
  signal?: AbortSignal
}) {
  const path = getPathAccountDetails({ provider, owner })
  return Api.get({ path, provider, signal })
}

export function useAccountDetails({
  provider,
  owner,
  opts = {},
}: UseAccountDetailsArgs) {
  return useQuery({
    queryKey: ['accountDetails', provider, owner],
    queryFn: ({ signal }) => fetchAccountDetails({ provider, owner, signal }),
    ...opts,
  })
}
