import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

export function useRevokeUserToken({ provider }: { provider: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tokenid }: { tokenid: string }) => {
      const query = `
      mutation RevokeUserToken($input: RevokeUserTokenInput!) {
        revokeUserToken(input: $input) {
          error {
            __typename
          }
        }
      }
    `
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          input: { tokenid },
        },
        mutationPath: 'revokeUserToken',
      }).then((res) => {
        queryClient.invalidateQueries(['sessions'])
      })
    },
    useErrorBoundary: true,
  })
}
