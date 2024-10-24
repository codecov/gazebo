import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

export function useRegenerateOrgUploadToken(
  { onSuccess = () => {} } = { onSuccess: () => {} }
) {
  const { provider, owner } = useParams()
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
      queryClient.invalidateQueries('DetailOwner')
    },
  })
}
