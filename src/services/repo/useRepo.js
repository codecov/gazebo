import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchRepoDetails({ provider, owner, repo, signal }) {
  const query = `
    query GetRepo($name: String!, $repo: String!){
      owner(username:$name){
        isCurrentUserPartOfOrg
        isCurrentUserActivated
        repository(name:$repo){
          private
          uploadToken
          defaultBranch
          yaml
          activated
          oldestCommitAt
          active
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
      isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
    }
  })
}

export function useRepo({ provider, owner, repo }) {
  return useQuery({
    queryKey: ['GetRepo', provider, owner, repo],
    queryFn: ({ signal }) =>
      fetchRepoDetails({ provider, owner, repo, signal }),
  })
}
