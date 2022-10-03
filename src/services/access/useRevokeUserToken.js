import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

export function useRevokeUserToken({ provider }) {
  const queryClient = useQueryClient()
  return useMutation(
    ({ tokenid }) => {
      const query = `
      mutation RevokeUserToken($input: RevokeUserTokenInput!) {
        revokeUserToken(input: $input) {
          error {
            __typename
          }
        }
      }
    `
      const variables = { input: { tokenid } }

      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'revokeUserToken',
      }).then((res) => {
        queryClient.invalidateQueries('sessions')
      })
    },
    {
      useErrorBoundary: true,
    }
  )
}
