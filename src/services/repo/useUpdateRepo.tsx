import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

const query = `
  mutation UpdateRepository(
    $repoName: String!
    $branch: String
    $activated: Boolean 
) {
    updateRepository(input: { branch: $branch, activated: $activated, repoName: $repoName }) {
      error {
        ... on ValidationError {
          __typename
          message
        }
        ... on UnauthenticatedError {
          __typename
          message
        }
        ... on UnauthorizedError {
          __typename
          message
        }
      }
    }
  }
`

interface URLParams {
  provider: string
  owner: string
  repo: string
}

interface MutationArgs {
  activated?: boolean
  branch?: number
}

export const useUpdateRepo = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const addToast = useAddNotification()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ activated, branch }: MutationArgs) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          owner,
          repoName: repo,
          activated,
          branch,
        },
        mutationPath: 'UpdateRepository',
      })
    },
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries(['GetRepo'])
      queryClient.invalidateQueries(['GetRepoSettings'])
      const error = data?.regenerateRepositoryUploadToken?.error
      if (error) {
        addToast({
          type: 'error',
          text: `We were not able to update this repo`,
        })
      }
    },
    retry: false,
  })
}
