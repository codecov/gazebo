import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

const TOAST_DURATION = 10000

const query = `
  mutation RegenerateRepositoryUploadToken(
    $owner: String!
    $repoName: String!
) {
    regenerateRepositoryUploadToken(input: { owner: $owner, repoName: $repoName }) {
      error {
        ... on ValidationError {
          __typename
          message
        }
      }
      token
    }
  }
`

interface URLParams {
  provider: string
  owner: string
  repo: string
}

export const useRegenerateRepoUploadToken = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const addToast = useAddNotification()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          owner,
          repoName: repo,
        },
        mutationPath: 'regenerateRepositoryUploadToken',
      })
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(['GetRepo'])
      queryClient.invalidateQueries(['GetRepoSettings'])
      const error = data?.regenerateRepositoryUploadToken?.error
      if (error) {
        if (error?.__typename === 'ValidationError') {
          addToast({
            type: 'error',
            text: 'Something went wrong',
            disappearAfter: TOAST_DURATION,
          })
        }
      } else {
        addToast({
          type: 'success',
          text: 'Repo upload token regenerated successfully',
          disappearAfter: TOAST_DURATION,
        })
      }
      return data?.regenerateRepositoryUploadToken?.token
    },
    retry: false,
  })
}
