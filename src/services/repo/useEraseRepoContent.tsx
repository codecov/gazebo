import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

const query = `
  mutation EraseRepository($repoName: String!) {
    eraseRepository(input: { repoName: $repoName }) {
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

export const useEraseRepoContent = () => {
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
          text: "We were unable to erase this repo's content",
        })
      } else {
        addToast({
          type: 'success',
          text: 'Repo coverage content erased successfully',
        })
      }
      queryClient.invalidateQueries(['GetRepo'])
      queryClient.invalidateQueries(['GetRepoSettings'])
    },
    onError: () => {
      addToast({
        type: 'error',
        text: "We were unable to erase this repo's content",
      })
    },
    retry: false,
  })
}
