import Api from 'shared/api'
import { useMutation, useQuery, useQueryClient } from 'react-query'

export function useYamlConfig({ provider, variables }) {
  const query = `
  query YamlConfig ($username: String!) {
    owner(username: $username) {
      yaml
    }
  }
  `

  return useQuery(['yaml', provider], () => {
    return Api.graphql({ provider, query, variables }).then((res) => {
      const yaml = res?.data?.owner?.yaml
      if (!yaml) return null
      return yaml
    })
  })
}

export function useUpdateYaml({ provider, variables }) {
  const queryClient = useQueryClient()
  return useMutation(() => {
    const query = `
    mutation($username: String!) {
      me {
        yaml(content: $content) {
          error
        }
      }
    }
  `
    console.log('Do update later')

    return Api.graphql({ provider, query, variables }).then((res) => {
      queryClient.invalidateQueries('yaml')
      return res?.data?.yaml?.error
    })
  })
}
