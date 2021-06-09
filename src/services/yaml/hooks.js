import Api from 'shared/api'
import { useParams, useHistory } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from 'react-query'

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

export function useUpdateYaml({ username }) {
  const { provider } = useParams()
  const queryClient = useQueryClient()
  const history = useHistory()

  return useMutation(
    ({ yaml }) => {
      const query = `
        mutation UpdateYamlConfig ($input: SetYamlOnOwnerInput!) {
          setYamlOnOwner(input: $input) {
            error
            owner {
              username
              yaml
            }
          }
        }
      `

      const variables = { input: { username, yaml } }
      return Api.graphql({ provider, query, variables })
    },
    {
      onSuccess: ({ data }) => {
        if (data?.setYamlOnOwner?.error === 'unauthenticated') {
          history.go() // Force refresh to trigger error, throwing error didnt catch error boundary. I don't love that graphQL errors are not getting caught by the error boundary
        }
        queryClient.invalidateQueries('YamlConfig')
      },
    }
  )
}
