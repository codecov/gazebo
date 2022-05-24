import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getRegenrateTokenPath({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/regenerate-upload-token/`
}

function regenerateUploadToken({ provider, owner, repo }) {
  const refactoredProvider = providerToName(provider).toLowerCase()
  const path = getRegenrateTokenPath({
    provider: refactoredProvider,
    owner,
    repo,
  })
  return Api.patch({ path, provider: refactoredProvider })
}

export function useRegenerateUploadToken() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation(() => regenerateUploadToken({ provider, owner, repo }), {
    onSuccess: () => {
      queryClient.invalidateQueries('GetRepo')
    },
  })
}
