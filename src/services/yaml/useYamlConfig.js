import { useQuery } from '@tanstack/react-query'
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
  return useQuery({
    queryKey: ['YamlConfig', provider, variables?.username, query, variables],
    queryFn: ({ signal }) =>
      Api.graphql({ provider, query, variables, signal }).then((res) => {
        const yaml = res?.data?.owner?.yaml
        return yaml
      }),
  })
}
