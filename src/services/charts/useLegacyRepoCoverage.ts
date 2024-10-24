import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'
import { providerToInternalProvider } from 'shared/utils'

function getRepoCoverage({ provider, owner }) {
  const internalProvider = providerToInternalProvider(provider)
  return `/charts/${internalProvider}/${owner}/coverage/repository`
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
  return useQuery({
    queryKey: ['legacyRepo', 'coverage', provider, owner, branch, trend, body],
    queryFn: ({ signal }) =>
      fetchRepoCoverage({ provider, owner, body, signal }),
    ...opts,
  })
}
