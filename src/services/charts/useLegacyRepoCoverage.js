import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getRepoCoverage({ provider, owner }) {
  return `/charts/${providerToName(
    provider
  ).toLowerCase()}/${owner}/coverage/repository`
}

function fetchRepoCoverage({ provider, owner, body, signal }) {
  const path = getRepoCoverage({ provider, owner })
  return Api.post({ path, provider, body, signal })
}

export function useLegacyRepoCoverage({
  provider,
  owner,
  branch,
  trend,
  body,
  opts = {},
}) {
  console.log(body)
  return useQuery(
    ['legacyRepo', 'coverage', provider, owner, branch, trend],
    ({ signal }) => fetchRepoCoverage({ provider, owner, body, signal }),
    opts
  )
}
