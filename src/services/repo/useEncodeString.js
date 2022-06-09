import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getEncodeStringPath({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/encode`
}

function encodeString({ provider, owner, repo, value }) {
  const refactoredProvider = providerToName(provider).toLowerCase()
  const path = getEncodeStringPath({
    provider: refactoredProvider,
    owner,
    repo,
  })
  return Api.post({ path, provider: refactoredProvider, body: { value } })
}

export function useEncodeString() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation(
    ({ value }) => encodeString({ provider, owner, repo, value }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('GetRepo')
      },
    }
  )
}
