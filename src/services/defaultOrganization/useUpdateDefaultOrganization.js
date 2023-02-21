import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useHistory, useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

export function useUpdateDefaultOrganization() {
  const { provider } = useParams()
  const history = useHistory()
  const queryClient = useQueryClient()
  const addToast = useAddNotification()

  return useMutation({ mutationFn: ({ username = null }) => {
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
      const variables = { input: { username } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'updateDefaultOrganization',
      })
    }, onSuccess: ({ data }) => {
        const error = data?.updateDefaultOrganization?.error?.__typename
        if (error === 'ValidationError') {
          throw new Error(
            'Organization does not belong in the current users organization list'
          )
        } else {
          queryClient.invalidateQueries('DetailOwner')
          history.push(
            `/${provider}/${data?.updateDefaultOrganization?.username}`
          )
        }
      }, onError: (e) => {
        return addToast({
          type: 'error',
          text: e.message,
        })
      } })
}
