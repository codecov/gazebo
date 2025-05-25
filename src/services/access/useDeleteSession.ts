import {
  useMutation as useMutationV5,
  useQueryClient as useQueryClientV5,
} from '@tanstack/react-queryV5'

import Api from 'shared/api'

import { SessionsQueryOpts } from './SessionsQueryOpts'

const query = `mutation DeleteSession($input: DeleteSessionInput!) {
  deleteSession(input: $input) {
    error {
      __typename
    }
  }
}`

interface UseDeleteSessionArgs {
  provider: string
}

export function useDeleteSession({ provider }: UseDeleteSessionArgs) {
  const queryClient = useQueryClientV5()
  return useMutationV5({
    mutationFn: ({ sessionid }: { sessionid: number }) => {
      const variables = { input: { sessionid } }

      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'deleteSession',
      })
    },
    throwOnError: true,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: SessionsQueryOpts({ provider }).queryKey,
      })
    },
  })
}
