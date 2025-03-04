import {
  useMutation as useMutationV5,
  useQueryClient as useQueryClientV5,
} from '@tanstack/react-queryV5'
import { z } from 'zod'

import Api from 'shared/api'
import { rejectNetworkError } from 'shared/api/rejectNetworkError'

import { USER_TOKEN_TYPE } from './constants'
import { SessionsQueryOpts } from './SessionsQueryOpts'

const UseGenerateTokenResponseSchema = z.object({
  createUserToken: z
    .object({
      fullToken: z.string().nullable(),
      error: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('ValidationError'),
            message: z.string(),
          }),
          z.object({
            __typename: z.literal('UnauthenticatedError'),
            message: z.string(),
          }),
        ])
        .nullable(),
    })
    .nullable(),
})

const query = `mutation CreateUserToken($input: CreateUserTokenInput!) {
  createUserToken(input: $input) {
    fullToken
    error {
      __typename
    }
  }
}`

export function useGenerateUserToken({ provider }: { provider: string }) {
  const queryClientV5 = useQueryClientV5()
  return useMutationV5({
    mutationFn: ({ name }: { name: string }) => {
      const variables = { input: { name, tokenType: USER_TOKEN_TYPE.API } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'createUserToken',
      }).then((res) => {
        const callingFn = 'useGenerateUserToken'
        const parsedData = UseGenerateTokenResponseSchema.safeParse(res?.data)

        if (!parsedData.success) {
          return rejectNetworkError({
            errorName: 'Parsing Error',
            errorDetails: { callingFn, error: parsedData.error },
          })
        }

        return parsedData.data
      })
    },
    throwOnError: true,
    onSuccess: () => {
      queryClientV5.invalidateQueries({
        queryKey: SessionsQueryOpts({ provider }).queryKey,
      })
    },
  })
}
