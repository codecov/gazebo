import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import Api from 'shared/api'
import { Provider, rejectNetworkError } from 'shared/api/helpers'

const query = `
  mutation RegenerateOrgUploadToken(
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

const ResponseSchema = z.object({
  regenerateOrgUploadToken: z
    .object({
      error: z
        .discriminatedUnion('__typename', [
          z.object({
            __typename: z.literal('UnauthorizedError'),
          }),
          z.object({
            __typename: z.literal('ValidationError'),
          }),
          z.object({
            __typename: z.literal('UnauthenticatedError'),
          }),
        ])
        .nullish(),
      orgUploadToken: z.string().nullish(),
    })
    .nullish(),
})

interface URLParams {
  provider: Provider
  owner: string
}

interface UseRegenerateOrgUploadTokenProps {
  onSuccess?: (
    data: z.infer<typeof ResponseSchema>['regenerateOrgUploadToken']
  ) => void
}

export function useRegenerateOrgUploadToken({
  onSuccess = () => {},
}: UseRegenerateOrgUploadTokenProps = {}) {
  const { provider, owner } = useParams<URLParams>()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: { input: { owner } },
        mutationPath: 'RegenerateOrgUploadToken',
      }).then(({ data }) => {
        const parsedRes = ResponseSchema.safeParse(data)
        if (!parsedRes.success) {
          return rejectNetworkError({
            status: 404,
            data: {},
            dev: 'useRegenerateOrgUploadToken - 404 schema parsing failed',
            error: parsedRes.error,
          })
        }

        return parsedRes.data.regenerateOrgUploadToken
      })
    },
    useErrorBoundary: true,
    onSuccess: (res) => {
      onSuccess(res)
      queryClient.invalidateQueries(['DetailOwner', 'GetOrgUploadToken'])
    },
  })
}
