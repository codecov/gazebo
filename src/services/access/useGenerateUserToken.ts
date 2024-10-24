import { useMutation, useQueryClient } from '@tanstack/react-query'

import Api from 'shared/api'

import { USER_TOKEN_TYPE } from './constants'

export function useGenerateUserToken({ provider, opts = {} }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name }) => {
      const query = `
        mutation CreateUserToken($input: CreateUserTokenInput!) {
          createUserToken(input: $input) {
            error {
              __typename
            }
            fullToken
          }
        }
      `
      const variables = { input: { name, tokenType: USER_TOKEN_TYPE.API } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'createUserToken',
      })
    },
    useErrorBoundary: true,
    onSuccess: () => {
      queryClient.invalidateQueries('sessions')
    },
  })
}
