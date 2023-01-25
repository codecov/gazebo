import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

export function useUpdateDefaultOrgToken() {
  const { provider } = useParams()
  const queryClient = useQueryClient()
  return useMutation(
    ({ username = null }) => {
      console.log('inside the use mutation', username)
      const query = `
        mutation updateDefaultOrgToken(
          $input: UpdateDefaultOrganizationInput!
        ) {
          updateDefaultOrganization(input: $input) {
            error {
              __typename
            }
          }
        }
      `
      const variables = { input: { username } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'updateDefaultOrganization',
      })
    },
    {
      useErrorBoundary: true,
      onSuccess: () => {
        queryClient.invalidateQueries('DetailOwner')
      },
    }
  )
}
