import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

export function useDeleteFlag() {
  const { provider, owner, repo } = useParams()
  const queryClient = useQueryClient()
  const addToast = useAddNotification()

  return useMutation({
    mutationFn: ({ flagName }) => {
      const query = `
        mutation deleteFlag(
          $input: DeleteFlagInput!
        ) {
          deleteFlag(input: $input) {
            error {
              __typename
            }
          }
        }
      `
      const variables = {
        input: { ownerUsername: owner, repoName: repo, flagName },
      }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'deleteFlag',
      })
    },
    onSuccess: ({ data }) => {
      const error = data?.deleteFlag?.error?.__typename
      if (error) {
        throw new Error('There was an error deleting your flag')
      } else {
        queryClient.invalidateQueries('RepoFlags')
      }
    },
    onError: (e) => {
      return addToast({
        type: 'error',
        text: e.message,
      })
    },
  })
}
