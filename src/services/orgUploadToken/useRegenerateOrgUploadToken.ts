import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

interface URLParams {
  provider: string
  owner: string
}

export function useRegenerateOrgUploadToken(
  { onSuccess = (data: any) => {} } = { onSuccess: () => {} }
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

      return data
    },
    useErrorBoundary: true,
    onSuccess: ({ data }) => {
      onSuccess(data)
      queryClient.invalidateQueries(['DetailOwner'])
    },
  })
}
