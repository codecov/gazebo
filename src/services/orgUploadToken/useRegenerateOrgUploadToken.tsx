import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { z } from 'zod'

import { renderToast } from 'services/toast'
import Api from 'shared/api'
import { Provider, rejectNetworkError } from 'shared/api/helpers'

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

type RegenerateOrgUploadTokenData = z.infer<typeof ResponseSchema>

interface UseRegenerateOrgUploadTokenProps {
  onSuccess?: (data: RegenerateOrgUploadTokenData) => void
}

export function useRegenerateOrgUploadToken({
  onSuccess = () => {},
}: UseRegenerateOrgUploadTokenProps = {}) {
  const { provider, owner } = useParams<URLParams>()
  const queryClient = useQueryClient()

  const renderErrorToast = () => {
    renderToast({
      type: 'error',
      title: 'Error generating upload token',
      content: 'Please try again. If the error persists please contact support',
      options: {
        duration: 10000,
      },
    })
  }

  return useMutation({
    mutationFn: () => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: { input: { owner } },
        mutationPath: 'regenerateOrgUploadToken',
      })
    },
    useErrorBoundary: true,
    onSuccess: ({ data }) => {
      const parsedRes = ResponseSchema.safeParse(data)
      if (!parsedRes.success) {
        return rejectNetworkError({
          status: 404,
          data: {},
          dev: 'useRegenerateOrgUploadToken - 404 schema parsing failed',
          error: parsedRes.error,
        })
      }

      if (data?.regenerateOrgUploadToken?.error) {
        renderErrorToast()
      } else {
        onSuccess(data)
      }
    },
    onError: renderErrorToast,
    onSettled: () => {
      queryClient.invalidateQueries(['DetailOwner'])
    },
    retry: false,
  })
}
