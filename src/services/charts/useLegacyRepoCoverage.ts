import { useQuery } from '@tanstack/react-query'

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
  body: any
  signal: AbortSignal
}) {
  const path = getRepoCoverage({ provider, owner })
  return Api.post({ path, provider, body, signal })
}

interface UseLegacyRepoCoverageArgs {
  provider: string
  owner: string
  branch?: string
  trend?: string
  body?: any
  opts?: any
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
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      fetchRepoCoverage({ provider, owner, body, signal }),
    ...opts,
  })
}
