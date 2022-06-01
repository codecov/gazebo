import { useMutation, useQueryClient } from 'react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

export function useRegenerateProfilingToken() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  return useMutation(
    () => {
      const query = `
        mutation regenerateProfilingToken($input: RegenerateProfilingTokenInput!) {
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
    {
      useErrorBoundary: true,
      onSuccess: () => {
        queryClient.invalidateQueries('GetRepo')
      },
    }
  )
}
