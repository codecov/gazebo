import { useQuery } from '@tanstack/react-query'

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
    () => fetchOrgCoverage({ provider, owner, query }),
    opts
  )
}

function getRepoCoverage({ provider, owner }) {
  return `/charts/${providerToName(
    provider
  ).toLowerCase()}/${owner}/coverage/repository`
}

function fetchRepoCoverage({ provider, owner, body }) {
  const path = getRepoCoverage({ provider, owner })
  return Api.post({ path, provider, body })
}

export function useLegacyRepoCoverage({
  provider,
  owner,
  branch,
  trend,
  body,
  opts = {},
}) {
  return useQuery(
    ['legacyRepo', 'coverage', provider, owner, branch, trend],
    () => fetchRepoCoverage({ provider, owner, body }),
    opts
  )
}
