import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'
import { providerToInternalProvider } from 'shared/utils'

function getRegenerateRepoTokenPath({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/regenerate-upload-token/`
}

function regenerateRepoUploadToken({ provider, owner, repo }) {
  const refactoredProvider = providerToInternalProvider(provider)
  const path = getRegenerateRepoTokenPath({
    provider: refactoredProvider,
    owner,
    repo,
  })
  return Api.patch({ path, provider: refactoredProvider })
}

export function useRegenerateRepoUploadToken() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => regenerateRepoUploadToken({ provider, owner, repo }),
    onSuccess: () => {
      queryClient.invalidateQueries(['GetRepo'])
    },
  })
}
