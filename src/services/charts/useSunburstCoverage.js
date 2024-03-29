import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { providerToInternalProvider } from 'shared/utils'

function getSunburstCoverage({ provider, owner, repo }) {
  const internalProvider = providerToInternalProvider(provider)
  return `/${internalProvider}/${owner}/${repo}/coverage/tree`
}

function fetchSunburstCoverage({ provider, owner, query, repo, signal }) {
  const path = getSunburstCoverage({ provider, owner, repo })
  return Api.get({ path, provider, query, signal })
}

export function useSunburstCoverage(
  { provider, owner, repo, query },
  opts = {}
) {
  return useQuery({
    queryKey: ['organization', 'coverage', provider, owner, repo, query],
    queryFn: ({ signal }) =>
      fetchSunburstCoverage({ provider, owner, query, repo, signal }),
    ...opts,
  })
}
