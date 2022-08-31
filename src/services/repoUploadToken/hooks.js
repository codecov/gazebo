import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getRegenrateRepoTokenPath({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/regenerate-upload-token/`
}

function regenerateRepoUploadToken({ provider, owner, repo }) {
  const refactoredProvider = providerToName(provider).toLowerCase()
  const path = getRegenrateRepoTokenPath({
    provider: refactoredProvider,
    owner,
    repo,
  })
  return Api.patch({ path, provider: refactoredProvider })
}

export function useRegenerateRepoUploadToken() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation(() => regenerateRepoUploadToken({ provider, owner, repo }), {
    onSuccess: () => {
      queryClient.invalidateQueries(['GetRepo'])
    },
  })
}
