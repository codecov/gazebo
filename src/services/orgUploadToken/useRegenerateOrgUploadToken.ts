import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { NetworkErrorObject } from 'shared/api/helpers'

const RequestSchema = z.object({
  regenerateOrgUploadToken: z
    .object({
      orgUploadToken: z.string().nullish(),
      error: z
        .union([
          z.object({
            __typename: z.literal('UnauthorizedError'),
            message: z.string(),
          }),
          z.object({
            __typename: z.literal('ValidationError'),
            message: z.string(),
          }),
          z.object({
            __typename: z.literal('UnauthenticatedError'),
            message: z.string(),
          }),
        ])
        .nullish(),
    })
    .nullable(),
})

interface URLParams {
  provider: string
  owner: string
}

export function useRegenerateOrgUploadToken(
  { onSuccess = (data: z.infer<typeof RequestSchema>) => {} } = {
    onSuccess: () => {},
  }
) {
  const { provider, owner } = useParams<URLParams>()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const query = `
        mutation regenerateOrgUploadToken(
          $input: RegenerateOrgUploadTokenInput!
        ) {
          regenerateOrgUploadToken(input: $input) {
            error {
              __typename
            }
            orgUploadToken
          }
        }
      `
      const variables = { input: { owner } }
      const data = await Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'regenerateOrgUploadToken',
      })

      const parsedRes = RequestSchema.safeParse(data.data)
      if (!parsedRes.success) {
        return Promise.reject({
          status: 404,
          data: {},
          dev: 'useRegenerateOrgUploadToken - 404 schema parsing failed',
        } satisfies NetworkErrorObject)
      }

      return parsedRes
    },
    useErrorBoundary: true,
    onSuccess: ({ data }) => {
      onSuccess(data)
      queryClient.invalidateQueries(['DetailOwner'])
    },
  })
}
