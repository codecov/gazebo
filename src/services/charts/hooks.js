import { useQuery } from 'react-query'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getOrgCoverage({ provider, owner }) {
  return `/charts/${providerToName(
    provider
  ).toLowerCase()}/${owner}/coverage/organization`
}

function fetchOrgCoverage({ provider, owner, query }) {
  const path = getOrgCoverage({ provider, owner })
  return Api.get({ path, provider, query })
}

export function useOrgCoverage({ provider, owner, query, opts = {} }) {
  return useQuery(
    ['organization', 'coverage', provider, owner, query],
    () => {
      return fetchOrgCoverage({ provider, owner, query })
    },
    opts
  )
}
