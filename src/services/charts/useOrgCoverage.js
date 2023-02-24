import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getOrgCoverage({ provider, owner }) {
  return `/charts/${providerToName(
    provider
  ).toLowerCase()}/${owner}/coverage/organization`
}

function fetchOrgCoverage({ provider, owner, query, signal }) {
  const path = getOrgCoverage({ provider, owner })
  return Api.get({ path, provider, query, signal })
}

export function useOrgCoverage({ provider, owner, query, opts = {} }) {
  return useQuery({
    queryKey: ['organization', 'coverage', provider, owner, query],
    queryFn: ({ signal }) =>
      fetchOrgCoverage({ provider, owner, query, signal }),
    ...opts,
  })
}
