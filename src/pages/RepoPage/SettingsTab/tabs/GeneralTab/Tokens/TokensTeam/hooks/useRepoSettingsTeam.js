import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom/cjs/react-router-dom.min'

import Api from 'shared/api'

function fetchRepoSettingsDetails({ provider, owner, repo, signal }) {
  const query = `
    query GetRepoSettings($name: String!, $repo: String!){
      owner(username:$name){
        repository: repositoryDeprecated(name:$repo){
          private
          activated
          uploadToken
          defaultBranch
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
    signal,
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

export function useRepoSettingsTeam() {
  const { provider, owner, repo } = useParams()

  return useQuery({
    queryKey: ['GetRepoSettingsTeam', provider, owner, repo],
    queryFn: ({ signal }) =>
      fetchRepoSettingsDetails({ provider, owner, repo, signal }),
  })
}
