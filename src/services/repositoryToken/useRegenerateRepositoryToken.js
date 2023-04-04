import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

export function useRegenerateRepositoryToken({ tokenType }) {
  // TODO: would be ideal if these are called from the component itself and not from the hook itself. You never know which route will call this, so the useParams will be unpredictible :) changing the responsibility to the parent component ensures the parent has the necessary parameters
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      const query = `
        mutation RegenerateRepositoryToken(
          $input: RegenerateRepositoryTokenInput!
        ) {
          regenerateRepositoryToken(input: $input) {
            error {
              __typename
            }
            token
          }
        }
      `
      const variables = { input: { owner, repoName: repo, tokenType } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'regenerateRepositoryToken',
      })
    },
    useErrorBoundary: true,
    onSuccess: () => {
      queryClient.invalidateQueries(['GetRepoSettings'])
    },
  })
}
