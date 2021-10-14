import { useQuery } from 'react-query'
import Api from 'shared/api'

function fetchRepoDetails({ provider, owner, repo }) {
  const query = `
    query GetRepo($name: String!, $repo: String!){
      owner(username:$name){
        repository(name:$repo){
          private
          uploadToken
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
    const repo = res?.data?.owner?.repository
    if (!repo) return null
    return repo
  })
}

export function useRepo({ provider, owner, repo }) {
  return useQuery([provider, owner, repo], () => {
    return fetchRepoDetails({ provider, owner, repo })
  })
}
