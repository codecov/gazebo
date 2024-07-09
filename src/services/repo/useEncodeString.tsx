import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import { useAddNotification } from 'services/toastNotification'
import Api from 'shared/api'

const query = `
  mutation EncodeSecretString($repoName: String!, $value: String!) {
    encodeSecretString(input: { repoName: $repoName, value: $value }) {
      value
      error {
        ... on ValidationError {
          __typename
          message
        }
        ... on UnauthenticatedError {
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

export const useEncodeString = () => {
  const { provider, owner, repo } = useParams<URLParams>()
  const addToast = useAddNotification()
  return useMutation({
    mutationFn: (value: string) => {
      return Api.graphqlMutation({
        provider,
        query,
        variables: {
          owner,
          repoName: repo,
          value,
        },
        mutationPath: 'EncodeSecretString',
      })
    },
    onSuccess: ({ data }) => {
      const error = data?.encodeSecretString?.error
      if (error) {
        addToast({
          type: 'error',
          text: `We were unable to generate the secret string`,
        })
      }
    },
    retry: false,
  })
}
