import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification/context'
import Api from 'shared/api'

const query = `
mutation updateDefaultOrganization(
  $input: UpdateDefaultOrganizationInput!
) {
  updateDefaultOrganization(input: $input) {
    error {
      __typename
    }
    username
  }
}
`

export function useUpdateDefaultOrganization() {
  // @ts-expect-error  useParams needs to be converted
  const { provider } = useParams()
  const queryClient = useQueryClient()
  const addToast = useAddNotification()

  return useMutation({
    mutationFn: ({ username = null }: { username: string | null }) => {
      const variables = { input: { username } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'updateDefaultOrganization',
      })
    },
    onSuccess: ({ data }) => {
      const error = data?.updateDefaultOrganization?.error?.__typename
      if (error === 'ValidationError') {
        throw new Error(
          'Organization does not belong in the current users organization list'
        )
      } else {
        queryClient.invalidateQueries(['DetailOwner'])
        queryClient.invalidateQueries(['currentUser'])
      }
    },
    onError: (e: any) => {
      return addToast({
        type: 'error',
        text: e.message,
      })
    },
  })
}
