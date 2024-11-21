import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

const query = `
mutation RevokeUserToken($input: RevokeUserTokenInput!) {
  revokeUserToken(input: $input) {
    error {
      __typename
    }
  }
}`

export function useRevokeUserToken({ provider }: { provider: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tokenid }: { tokenid: string }) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          input: { tokenid },
        },
        mutationPath: 'revokeUserToken',
      }).then(() => {
        queryClient.invalidateQueries(['sessions'])
      })
    },
    useErrorBoundary: true,
  })
}
