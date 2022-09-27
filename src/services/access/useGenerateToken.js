import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

export function useGenerateToken({ provider, opts = {} }) {
  const queryClient = useQueryClient()
  return useMutation(
    ({ name }) => {
      const query = `
        mutation($input: CreateApiTokenInput!) {
          createApiToken(input: $input) {
            error {
              __typename
            }
            fullToken
          }
        }
      `
      const variables = { input: { name } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'createApiToken',
      })
    },
    {
      useErrorBoundary: true,
      onSuccess: () => {
        queryClient.invalidateQueries('sessions')
      },
    }
  )
}
