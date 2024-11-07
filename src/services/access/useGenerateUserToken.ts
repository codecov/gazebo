import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject, rejectNetworkError } from 'shared/api/helpers'

import { USER_TOKEN_TYPE } from './constants'

const UseGenerateTokenResponseSchema = z.object({
  createUserToken: z
    .object({
      error: z
        .union([
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
      fullToken: z.string().nullable(),
    })
    .nullable(),
})

export function useGenerateUserToken({ provider }: { provider: string }) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ name }: { name: string }) => {
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
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(['sessions'])

      const parsedData = UseGenerateTokenResponseSchema.safeParse(data)
      if (!parsedData.success) {
        return rejectNetworkError({
          status: 404,
          data: {},
          dev: 'useGenerateUserToken - 404 failed to parse',
        } satisfies NetworkErrorObject)
      }
    },
  })
}
