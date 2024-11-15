import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { providerToInternalProvider } from 'shared/utils/provider'

function getRepoPath({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/`
}

function updateRepo({ provider, owner, repo, body }) {
  const refactoredProvider = providerToInternalProvider(provider)
  const path = getRepoPath({
    provider: refactoredProvider,
    owner,
    repo,
  })
  return Api.patch({ path, provider: refactoredProvider, body })
}

export function useUpdateRepo() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ...body }) => updateRepo({ provider, owner, repo, body }),
    onSuccess: () => {
      queryClient.invalidateQueries(['GetRepo'])
      queryClient.invalidateQueries(['GetRepoSettings'])
    },
  })
}
