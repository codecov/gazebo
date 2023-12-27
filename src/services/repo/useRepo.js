import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

function fetchRepoDetails({ provider, owner, repo, signal }) {
  const query = `
    query GetRepo($name: String!, $repo: String!){
      owner(username:$name){
        isAdmin
        isCurrentUserPartOfOrg
        isCurrentUserActivated
        orgUploadToken
        repository: repositoryDeprecated(name:$repo){
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
      isAdmin: res?.data?.owner?.isAdmin,
      repository: res?.data?.owner?.repository,
      isCurrentUserPartOfOrg: res?.data?.owner?.isCurrentUserPartOfOrg,
      isCurrentUserActivated: res?.data?.owner?.isCurrentUserActivated,
      orgUploadToken: res?.data?.owner?.orgUploadToken,
    }
  })
}

export function useRepo({ provider, owner, repo, opts = {} }) {
  return useQuery({
    queryKey: ['GetRepo', provider, owner, repo],
    queryFn: ({ signal }) =>
      fetchRepoDetails({ provider, owner, repo, signal }),
    ...opts,
  })
}
