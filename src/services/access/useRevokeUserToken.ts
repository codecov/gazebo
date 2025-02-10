import {
  useMutation as useMutationV5,
  useQueryClient as useQueryClientV5,
} from '@tanstack/react-queryV5'

import Api from 'shared/api'

import { SessionsQueryOpts } from './SessionsQueryOpts'

const query = `mutation RevokeUserToken($input: RevokeUserTokenInput!) {
  revokeUserToken(input: $input) {
    error {
      __typename
    }
  }
}`

export function useRevokeUserToken({ provider }: { provider: string }) {
  const queryClient = useQueryClientV5()
  return useMutationV5({
    mutationFn: ({ tokenid }: { tokenid: string }) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          input: { tokenid },
        },
        mutationPath: 'revokeUserToken',
      }).then(() => {
        queryClient.invalidateQueries({
          queryKey: SessionsQueryOpts({ provider }).queryKey,
        })
      })
    },
    throwOnError: true,
  })
}
