import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { Provider } from 'shared/api/helpers'
import { providerToInternalProvider } from 'shared/utils/provider'

interface SunburstCoverageArgs {
  provider: Provider
  owner: string
  repo: string
  query?: {
    branch?: string
    flags?: string[]
    components?: string[]
  }
  signal?: AbortSignal
}

function getSunburstCoverage({ provider, owner, repo }: SunburstCoverageArgs) {
  const internalProvider = providerToInternalProvider(provider)
  return `/${internalProvider}/${owner}/${repo}/coverage/tree`
}

function fetchSunburstCoverage({
  provider,
  owner,
  repo,
  query,
  signal,
}: SunburstCoverageArgs) {
  const path = getSunburstCoverage({ provider, owner, repo })
  return Api.get({ path, provider, query, signal })
}

export function useSunburstCoverage(
  { provider, owner, repo, query }: SunburstCoverageArgs,
  opts = {}
) {
  return useQuery({
    queryKey: ['organization', 'coverage', provider, owner, repo, query],
    queryFn: ({ signal }) =>
      fetchSunburstCoverage({ provider, owner, query, repo, signal }),
    ...opts,
  })
}
