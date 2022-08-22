import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

function fetchRepoSettingsDetails({ provider, owner, repo }) {
  const query = `
    query GetRepoSettings($name: String!, $repo: String!){
      owner(username:$name){
        repository(name:$repo){
          private
          activated
          uploadToken
          defaultBranch
          profilingToken
          graphToken
          yaml
          bot {
            username
          }
        }
      }
    }
`
  return Api.graphql({
    provider,
    repo,
    query,
    variables: {
      name: owner,
      repo,
    },
  }).then((res) => {
    return {
      repository: res?.data?.owner?.repository,
    }
  })
}

export function useRepoSettings() {
  const { provider, owner, repo } = useParams()

  return useQuery(['GetRepoSettings', provider, owner, repo], () => {
    return fetchRepoSettingsDetails({ provider, owner, repo })
  })
}
