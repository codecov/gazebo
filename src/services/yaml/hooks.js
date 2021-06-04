import Api from 'shared/api'
import { useParams } from 'react-router-dom'
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
  return useMutation(({ yaml }) => {
    const query = `
    mutation($input: SetYamlOnOwnerInput!) {
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
    return Api.graphql({ provider, query, variables }).then((res) => {
      queryClient.invalidateQueries('yamlConfig')
      return res?.data?.yaml?.error
    })
  })
}
