import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getSunburstCoverage({ provider, owner, repo }) {
  return `/${providerToName(
    provider
  )?.toLowerCase()}/${owner}/${repo}/coverage/tree`
}

function fetchSunburstCoverage({ provider, owner, query, repo, signal }) {
  const path = getSunburstCoverage({ provider, owner, repo })
  return Api.get({ path, provider, query, signal })
}

export function useSunburstCoverage(
  { provider, owner, repo, query },
  opts = {}
) {
  return useQuery(
    ['organization', 'coverage', provider, owner, repo, query],
    ({ signal }) =>
      fetchSunburstCoverage({ provider, owner, query, repo, signal }),
    opts
  )
}
