import { useMutation } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

const query = `
  mutation UpdateYamlConfig ($input: SetYamlOnOwnerInput!) {
    setYamlOnOwner(input: $input) {
      error {
        __typename
        ... on ValidationError {
          message
        }
        ... on UnauthorizedError {
          message
        }
        ... on NotFoundError {
          message
        }
        ... on UnauthenticatedError {
          message
        }
      }
      owner {
        username
        yaml
      }
    }
  }
`

export function useUpdateYaml({ username }) {
  const { provider } = useParams()

  return useMutation({
    mutationFn: ({ yaml }) => {
      const variables = { input: { username: username, yaml } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'setYamlOnOwner',
      })
    },
    useErrorBoundary: true,
  })
}
