import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

export function useDeleteSession({ provider }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionid }) => {
      const query = `
      mutation DeleteSession($input: DeleteSessionInput!) {
        deleteSession(input: $input) {
          error {
            __typename
          }
        }
      }
    `
      const variables = { input: { sessionid } }

      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'deleteSession',
      }).then((res) => {
        queryClient.invalidateQueries('sessions')
      })
    },
    useErrorBoundary: true,
  })
}
