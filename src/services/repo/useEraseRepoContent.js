import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'
import { providerToName } from 'shared/utils'

function getPathEraseRepo({ provider, owner, repo }) {
  return `/${provider}/${owner}/repos/${repo}/erase/`
}

export function useEraseRepoContent() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  const refactoredProvider = providerToName(provider).toLowerCase()
  return useMutation(
    () => {
      const path = getPathEraseRepo({
        provider: refactoredProvider,
        owner,
        repo,
      })

      return Api.patch({
        provider: refactoredProvider,
        path,
      })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['GetRepo'])
      },
    }
  )
}
