import { QueryOptions, useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { providerToInternalProvider } from 'shared/utils'

function getRepoCoverage({
  provider,
  owner,
}: {
  provider: string
  owner: string
}) {
  const internalProvider = providerToInternalProvider(provider)
  return `/charts/${internalProvider}/${owner}/coverage/repository`
}

function fetchRepoCoverage({
  provider,
  owner,
  body,
  signal,
}: {
  provider: string
  owner: string
  body?: string
  signal?: AbortSignal
}) {
  const path = getRepoCoverage({ provider, owner })
  return Api.post({ path, provider, body, signal })
}

interface UseLegacyRepoCoverageArgs {
  provider: string
  owner: string
  branch?: string
  trend?: string
  body?: string
  opts?: QueryOptions
  query?: {
    groupingUnit: string
  }
}

export function useLegacyRepoCoverage({
  provider,
  owner,
  branch,
  trend,
  body,
  opts = {},
}: UseLegacyRepoCoverageArgs) {
  return useQuery({
    queryKey: ['legacyRepo', 'coverage', provider, owner, branch, trend, body],
    queryFn: ({ signal }) =>
      fetchRepoCoverage({ provider, owner, body, signal }),
    ...opts,
  })
}
