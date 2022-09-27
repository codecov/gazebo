import { useQuery } from '@tanstack/react-query'

import Api from 'shared/api'

export function useCommitYaml({ provider, owner, repo, commitid }) {
  const query = `
    query CommitYaml($owner: String!, $repo: String!, $commitid: String!) {
      owner(username: $owner) {
        repository(name: $repo) {
          commit(id: $commitid) {
            commitid
            yaml
          }
        }
      }
    }
  `

  return useQuery(['commit-yaml', provider, owner, repo, commitid], () => {
    return Api.graphql({
      provider,
      query,
      variables: {
        owner,
        repo,
        commitid,
      },
    }).then((res) => {
      return res?.data?.owner?.repository?.commit?.yaml
    })
  })
}
