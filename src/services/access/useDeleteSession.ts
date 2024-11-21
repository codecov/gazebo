import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

interface UseDeleteSessionArgs {
  provider: string
}

export function useDeleteSession({ provider }: UseDeleteSessionArgs) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ sessionid }: { sessionid: number }) => {
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
      }).then(() => {
        queryClient.invalidateQueries(['sessions'])
      })
    },
    useErrorBoundary: true,
  })
}
