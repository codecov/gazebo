import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification/context'
import Api from 'shared/api'

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface DeleteComponentMeasurementMutationArgs {
  componentId: string
}

const query = `
mutation deleteComponentMeasurements(
  $input: DeleteComponentMeasurementsInput!
) {
  deleteComponentMeasurements(input: $input) {
    error {
      __typename
    }
  }
}
`

export function useDeleteComponentMeasurements() {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()
  const addToast = useAddNotification()

  return useMutation({
    mutationFn: ({ componentId }: DeleteComponentMeasurementMutationArgs) => {
      const variables = {
        input: { ownerUsername: owner, repoName: repo, componentId },
      }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'deleteComponentMeasurements',
      })
    },
    onSuccess: ({ data }) => {
      const error = data?.deleteComponentMeasurements?.error?.__typename
      if (error) {
        // TODO: adjust backend to provide a message so we can tailor the message here
        addToast({
          type: 'error',
          text: 'There was an error deleting your component measurements',
        })
      } else {
        queryClient.invalidateQueries(['RepoFlags'])
      }
    },
    onError: (_e) => {
      addToast({
        type: 'error',
        text: 'There was an error deleting your component measurements',
      })
    },
  })
}
