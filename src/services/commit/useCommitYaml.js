import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useCommitYaml({ provider, owner, repo, commitid }) {
  const query = `
    query CommitYaml($owner: String!, $repo: String!, $commitid: String!) {
      owner(username: $owner) {
        repository: repositoryDeprecated(name: $repo) {
          commit(id: $commitid) {
            commitid
            yaml
          }
        }
      }
    }
  `

  return useQuery({
    queryKey: ['commit-yaml', provider, owner, repo, commitid, query],
    queryFn: ({ signal }) =>
      Api.graphql({
        provider,
        query,
        signal,
        variables: {
          owner,
          repo,
          commitid,
        },
      }).then((res) => {
        return res?.data?.owner?.repository?.commit?.yaml
      }),
  })
}
