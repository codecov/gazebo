import { useMutation, useQuery } from 'react-query'
import { useParams } from 'react-router-dom'

import Api from 'shared/api'

export function useYamlConfig({ variables }) {
  const { provider } = useParams()
  const query = `
    query YamlConfig($username: String!){
      owner(username: $username) {
        yaml
      }
    }
  `
  return useQuery(['YamlConfig', provider, variables?.username], () =>
    Api.graphql({ provider, query, variables }).then((res) => {
      const yaml = res?.data?.owner?.yaml
      return yaml
    })
  )
}

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

  return useMutation(
    ({ yaml }) => {
      const variables = { input: { username: username, yaml } }
      return Api.graphqlMutation({
        provider,
        query,
        variables,
        mutationPath: 'setYamlOnOwner',
      })
    },
    {
      useErrorBoundary: true,
    }
  )
}
