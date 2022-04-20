import { useQuery } from 'react-query'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getFlagsPath({ provider, owner, repo }) {
  return `/${providerToName(
    provider
  ).toLowerCase()}/${owner}/repos/${repo}/compare/flags`
}

function fetchFlagsCoverage({ provider, owner, repo, query }) {
  const path = getFlagsPath({ provider, owner, repo })
  return Api.get({ path, provider, query })
}

export function useFlagsForComparePage({
  provider,
  owner,
  repo,
  query,
  opts = {},
}) {
  return useQuery(
    ['compare', 'flags', provider, owner, repo, query],
    () => {
      return fetchFlagsCoverage({ provider, owner, repo, query })
    },
    opts
  )
}
