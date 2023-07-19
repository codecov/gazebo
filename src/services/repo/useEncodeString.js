import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { providerToInternalProvider } from 'shared/utils'

function getEncodeStringPath({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/encode/`
}

function encodeString({ provider, owner, repo, value }) {
  const refactoredProvider = providerToInternalProvider(provider)
  const path = getEncodeStringPath({
    provider: refactoredProvider,
    owner,
    repo,
  })
  return Api.post({ path, provider: refactoredProvider, body: { value } })
}

export function useEncodeString() {
  const { provider, owner, repo } = useParams()
  return useMutation({
    mutationFn: ({ value }) => encodeString({ provider, owner, repo, value }),
  })
}
