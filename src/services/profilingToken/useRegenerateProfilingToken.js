import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

export function useRegenerateProfilingToken() {
  // TODO: would be ideal if these are called from the component itself and not from the hook itself. You never know which route will call this, so the useParams will be unpredictible :) changing the responsibility to the parent component ensures the parent has the necessary parameters
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      const query = `
        mutation regenerateProfilingToken(
          $input: RegenerateProfilingTokenInput!
        ) {
          regenerateProfilingToken(input: $input) {
            error {
              __typename
            }
            profilingToken
          }
        }
      `
      const variables = { input: { owner, repoName: repo } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'regenerateProfilingToken',
      })
    },
    useErrorBoundary: true,
    onSuccess: () => {
      queryClient.invalidateQueries(['GetRepo'])
    },
  })
}
