import { useMutation, useQueryClient } from 'react-query'

import Api from 'shared/api'

export function useRegenerateProfilingToken({ provider }) {
  const queryClient = useQueryClient()
  return useMutation(
    ({ owner, repoName }) => {
      const query = `
        mutation($input: RegenerateProfilingTokenInput!) {
        regenerateProfilingToken(input: $input) {
            error {
              __typename
            }
            profilingToken
          }
        }
      `
      const variables = { input: { owner, repoName } }
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
