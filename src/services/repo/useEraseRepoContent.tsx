import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

const query = `
  mutation EraseRepository($owner: String!, $repoName: String!) {
    eraseRepository(input: { owner: $owner, repoName: $repoName }) {
      error {
        ... on UnauthorizedError {
          message
        }
        ... on ValidationError {
          message
        }
        ... on UnauthenticatedError {
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

export const useEraseRepo = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const queryClient = useQueryClient()
  const addToast = useAddNotification()
  return useMutation({
    mutationFn: () => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          owner,
          repoName: repo,
        },
        mutationPath: 'eraseRepository',
      })
    },
    onSuccess: ({ data }) => {
      const error = data?.eraseRepository?.error
      if (error) {
        addToast({
          type: 'error',
          text: 'We were unable to erase this repository',
        })
      } else {
        addToast({
          type: 'success',
          text: 'Repository erased successfully',
        })
      }
      queryClient.invalidateQueries(['GetRepo'])
      queryClient.invalidateQueries(['GetRepoSettings'])
    },
    onError: () => {
      addToast({
        type: 'error',
        text: 'We were unable to erase this repository',
      })
    },
    retry: false,
  })
}
