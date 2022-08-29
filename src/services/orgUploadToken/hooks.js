import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

export function useRegenerateOrgUploadToken() {
  const { provider, owner } = useParams()
  const queryClient = useQueryClient()
  return useMutation(
    () => {
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
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'regenerateOrgUploadToken',
      })
    },
    {
      useErrorBoundary: true,
      onSuccess: () => {
        queryClient.invalidateQueries(['DetailOwner'])
      },
    }
  )
}
